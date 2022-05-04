import * as firebase from 'firebase';
import shorthash from 'shorthash';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

import Product from '../../models/product';

export function fetchProducts() {
    return async (dispatch, getState) => {
        const { token, userId } = getState().auth;
        try {
            const fetchedProducts: any = [];

            const response = await fetch(
                `https://ezhop-aa90a.firebaseio.com/products.json?auth=${token}`
            );
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('401');
                }

                throw new Error('Something went wrong!');
            }

            const keys = Object.keys(data);
            const keysLength = keys.length - 1;
            const promisesArr = await keys.map(async (key, i) => {
                await cacher(data[key].imageUrl)
                    .then(async (finalImgUri) => {
                        fetchedProducts.push(
                            new Product(
                                key,
                                data[key].ownerId,
                                data[key].title,
                                String(finalImgUri),
                                data[key].description,
                                data[key].price
                            )
                        );
                    })
                    .catch((e) => {
                        throw new Error('Error: cacher inside');
                    });

                // Only return if last index is done,
                // returned value is a promise due to Product class
                if (i === keysLength) {
                    return {
                        products: fetchedProducts,
                        userProducts: await fetchedProducts.filter(
                            (prod) => prod.ownerId === userId
                        ),
                    };
                }
            });

            Promise.all(promisesArr).then((val) => {
                if (val[keysLength]) {
                    dispatch({ type: 'SET_PRODUCTS', payload: val[keysLength] });
                }
            });
        } catch (err) {
            throw err;
        }
    };
}

export function createProduct(payload) {
    const { title, description, price, imgToUpload } = payload;

    return async (dispatch, getState) => {
        const { token, userId } = getState().auth;

        try {
            const resizedImg = await imageResizer(imgToUpload);
            const blobedImg = await uriToBlob(resizedImg?.uri);

            await uploadToFirebase(blobedImg, title)
                .then((snapshot) => {
                    snapshot.ref.getDownloadURL().then(async (url) => {
                        const response = await fetch(
                            `https://ezhop-aa90a.firebaseio.com/products.json?auth=${token}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    title,
                                    description,
                                    imageUrl: url,
                                    price,
                                    ownerId: userId,
                                }),
                            }
                        );

                        const cachedImgUri = await cacher(url);

                        const data = await response.json();
                        const newPayload = {
                            title,
                            description,
                            price,
                            imageUrl: cachedImgUri,
                            id: data.name,
                            ownerId: userId,
                        };

                        dispatch({ type: 'CREATE_PRODUCT', payload: newPayload });
                    });
                })
                .catch((err) => {
                    throw err;
                });
        } catch (err) {
            throw err;
        }
    };
}

export function updateProduct(payload) {
    const { id, title, description, price, imgToUpload, imageUrl } = payload;

    return async (dispatch, getState) => {
        const { token } = getState().auth;

        try {
            // If new image was selected
            if (imgToUpload) {
                const resizedImg = await imageResizer(imgToUpload);
                const blobedImg = await uriToBlob(resizedImg?.uri);

                await uploadToFirebase(blobedImg, title)
                    .then((snapshot) => {
                        snapshot.ref.getDownloadURL().then(async (url) => {
                            await fetch(
                                `https://ezhop-aa90a.firebaseio.com/products/${id}.json?auth=${token}`,
                                {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        title,
                                        description,
                                        imageUrl: url,
                                        price,
                                    }),
                                }
                            );

                            const cachedImgUri = await cacher(url);

                            const newPayload = {
                                id,
                                title,
                                imageUrl: cachedImgUri,
                                description,
                                price,
                            };

                            dispatch({ type: 'UPDATE_PRODUCT', payload: newPayload });
                        });
                    })
                    .catch((err) => {
                        throw err;
                    });

                return;
            }

            // If no new image was selected
            await fetch(`https://ezhop-aa90a.firebaseio.com/products/${id}.json?auth=${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                }),
            });

            const newPayload = {
                id,
                title,
                imageUrl,
                description,
                price,
            };

            dispatch({ type: 'UPDATE_PRODUCT', payload: newPayload });
        } catch (err) {
            throw err;
        }
    };
}

export function setProductToEdit(payload) {
    return { type: 'SET_PRODUCT_TO_EDIT', payload };
}

export function deleteProduct(payload) {
    const { id } = payload;
    return async (dispatch, getState) => {
        const { token } = getState().auth;
        await fetch(`https://ezhop-aa90a.firebaseio.com/products/${id}.json?auth=${token}`, {
            method: 'DELETE',
        });

        dispatch({ type: 'DELETE_PRODUCT', payload });
    };
}

// Helpers
const uriToBlob = (uri) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function () {
            reject(new Error('Failed converting to Blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });
};

const uploadToFirebase = (blob, name) => {
    return new Promise((resolve, reject) => {
        const storageRef = firebase.storage().ref();

        storageRef
            .child(`images/${name}.jpg`)
            .put(blob, {
                contentType: 'image/jpeg',
            })
            .then((snapshot) => {
                blob.close();
                resolve(snapshot);
            })
            .catch((err) => reject(new Error('Failed image upload')));
    });
};

const imageResizer = (image) => {
    return new Promise((resolve, reject) => {
        ImageManipulator.manipulateAsync(
            image.localUri || image.uri,
            [{ resize: { width: image.width * 0.5, height: image.height * 0.5 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        )
            .then((res) => {
                resolve(res);
            })
            .catch((err) => reject(new Error('Failed image resize')));
    });
};

const cacher = (imageUri) => {
    // const name = shorthash.unique(imageUri);
    // const path = `${FileSystem.cacheDirectory}${name}`;
    // const image = await FileSystem.getInfoAsync(path);
    // if (image.exists) {
    //     return image.uri;
    // }
    //
    // const newImage = await FileSystem.downloadAsync(imageUri, path);
    // return newImage.uri;

    return new Promise((resolve, reject) => {
        const name = shorthash.unique(imageUri);
        const path = `${FileSystem.cacheDirectory}${name}`;
        FileSystem.getInfoAsync(path)
            .then((image) => {
                if (image.exists) {
                    resolve(image.uri);
                } else {
                    FileSystem.downloadAsync(imageUri, path)
                        .then((newImage) => {
                            resolve(newImage.uri);
                        })
                        .catch((err) => reject(new Error('Failed image cache 2')));
                }
            })
            .catch((err) => reject(new Error('Failed image cache 1')));
    });
};
