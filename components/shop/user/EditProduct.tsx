import React, {
    useRef,
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useReducer,
} from 'react';
import {
    Text,
    StyleSheet,
    View,
    Platform,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Button,
    Image,
    TouchableOpacity,
    Modal,
} from 'react-native';
import produce from 'immer';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { useSelector, useDispatch } from 'react-redux';
import MapView, { Marker } from 'react-native-maps';

import CusHeaderButton from '../../ui/CusHeaderButton';

import Color from '../../../defaults/Color';

import * as ProductsActions from '../../../store/actions/productsAction';

// Reducer with Immer
const formReducer = (draft, action) => {
    const { type, payload } = action;
    switch (type) {
        case 'ON_FIRST_RENDER': {
            draft.inputValues = payload.forInputs;
            draft.placeholderImg = payload.placeholderImg;
            return;
        }
        case 'SET_HEADER_TITLE': {
            draft.headerTitle = payload.headerTitle;
            return;
        }
        case 'SET_INPUT': {
            const { key, val } = payload;
            draft.inputValues[key] = val;
            return;
        }
        case 'SET_IMAGE_TO_UPLOAD': {
            draft.localImgToUpload = payload.localImgToUpload;
            return;
        }
        case 'SET_PLACEHOLDER_IMAGE': {
            draft.placeholderImg = payload.placeholderImg;
            return;
        }
        case 'SET_BOOLS': {
            const { key, val } = payload;
            draft.bools[key] = val;
            return;
        }
        case 'SET_LOCATION': {
            draft.location = payload;
            return;
        }
        case 'SET_PLACE_NAME': {
            draft.placeName = payload.placeName;
            return;
        }
        case 'RESET_INPUT': {
            draft.inputValues = {
                title: '',
                price: '',
                description: '',
            };
            return;
        }
        default:
            return;
    }
};

// Immer
const curriedFormReducer = produce(formReducer);

// The initial state for this component
const initialState = {
    inputValues: {
        title: '',
        price: '',
        description: '',
    },
    placeholderImg: null,
    localImgToUpload: null,
    headerTitle: '',
    bools: {
        hasChanged: false,
        hasRanOnce: false,
        hasError: false,
        hasLocalImg: false,
        isVisible: false,
    },
    location: {
        longitude: null,
        latitude: null,
    },
    placeName: '',
};

// TypeScript props/types
interface Props {}

export default function EditProduct() {
    const sheetRef = useRef(null);
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const hasParams: boolean = route?.params?.productId ? true : false;
    const { productId }: any = hasParams && route?.params;
    const productToEdit: [] = hasParams && useSelector((state) => state.products.productToEdit)[0];

    // Component states
    const [states, compDispatch] = useReducer(curriedFormReducer, initialState);
    const { headerTitle, placeholderImg, localImgToUpload, placeName } = states;
    const { title, price, description } = states?.inputValues;
    const { hasChanged, hasRanOnce, hasLocalImg, isVisible } = states?.bools;
    const { longitude, latitude } = states?.location;

    // Efffects
    useLayoutEffect(() => {
        const { save } = route?.params;

        navigation.setOptions({
            headerTitle,
            headerRight: () => (
                <HeaderButtons HeaderButtonComponent={CusHeaderButton}>
                    <Item
                        title="Save"
                        iconName={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                        onPress={() => save()}
                    />
                </HeaderButtons>
            ),
        });
    }, [navigation, route]);

    useLayoutEffect(() => {
        if (productToEdit) {
            const payload = {
                forInputs: {
                    title: productToEdit.title,
                    price: String(productToEdit.price),
                    description: productToEdit.description,
                },
                placeholderImg: productToEdit.imageUrl,
            };
            compDispatch({ type: 'ON_FIRST_RENDER', payload });
        }

        const payload = { headerTitle: hasParams ? 'Edit' : 'Add' };
        compDispatch({ type: 'SET_HEADER_TITLE', payload });
    }, []);

    useEffect(() => {
        if (hasRanOnce && !hasChanged) {
            setBools('hasChanged', true);
        }
        !hasRanOnce && setBools('hasRanOnce', true);
    }, [title, placeholderImg, price, description]);

    // Handlers ---------------------------------------------------------------------
    const handleInputChange = (key: string, val: string) => {
        const payload = { key, val };
        compDispatch({ type: 'SET_INPUT', payload });
    };

    const pickImage = async (which: string) => {
        let result;
        const pickOptions: Record<string, unknown> = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            exif: true,
        };

        if (which === 'camera') {
            result = await ImagePicker.launchCameraAsync(pickOptions);
        } else {
            result = await ImagePicker.launchImageLibraryAsync(pickOptions);
        }

        if (!result.cancelled) {
            const payload1 = { placeholderImg: result.uri };
            const payload2 = { localImgToUpload: result };
            const payload3 = {
                longitude: result.exif?.GPSLongitude,
                latitude: result.exif?.GPSLatitude,
            };
            compDispatch({ type: 'SET_PLACEHOLDER_IMAGE', payload: payload1 });
            compDispatch({ type: 'SET_IMAGE_TO_UPLOAD', payload: payload2 });
            compDispatch({ type: 'SET_LOCATION', payload: payload3 });

            fetchPlace(payload3);

            setBools('hasLocalImg', true);
            setBools('hasChanged', true);
            setBools('isVisible', false);

            return;
        }

        setBools('isVisible', false);
    };

    const handleSaveBtn = useCallback(() => {
        // If no changes
        if (!hasChanged) return;

        // If Editing a product
        // for some odd reasons, prop/value shorthand not working
        if (hasParams && productId) {
            const payload = {
                id: productId,
                title,
                imageUrl: placeholderImg,
                imgToUpload: localImgToUpload,
                price: Number(price),
                description,
            };
            dispatch(ProductsActions.updateProduct(payload));
            setBools('hasChanged', false);
            return;
        }

        // If Adding new product
        const payload = {
            title,
            imgToUpload: localImgToUpload,
            price: Number(price),
            description,
        };
        dispatch(ProductsActions.createProduct(payload));
        resetInputStates();
        setBools('hasChanged', false);
    }, [dispatch, title, placeholderImg, localImgToUpload, price, description, productId]);

    const onMapPressHandler = (coords) => {
        const payload = {
            longitude: coords.longitude,
            latitude: coords.latitude,
        };
        fetchPlace(coords);
        compDispatch({ type: 'SET_LOCATION', payload });
    };

    // Helpers ------------------------------------------------------------------------
    const setPermissions = async (which: string) => {
        if (which === 'library') {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
            pickImage('library');
            return;
        }

        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        }
        pickImage('camera');
    };

    const fetchPlace = async (coords) => {
        const GOOGLE_API_KEY = 'AIzaSyD6I1ZMagXPKyOvR2mwdlTyTduWpbIYHV0';
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}`
            );

            if (!response.ok) throw new Error('Opps!');

            const data = await response.json();
            // const longName = data.results[0].address_components[1].long_name
            const completeAddress = data.results[0].formatted_address;
            const payload = {
                placeName: completeAddress,
            };
            compDispatch({ type: 'SET_PLACE_NAME', payload });
        } catch (err) {
            throw err;
        }
    };

    const setBools = (key: string, val: any) => {
        const payload = { key, val };
        compDispatch({ type: 'SET_BOOLS', payload });
    };

    const resetInputStates = () => {
        compDispatch({ type: 'RESET_INPUT' });
    };

    const onDismiss = () => setBools('isVisible', false);

    const goTo = (location: string, option: {} = {}) => {
        navigation.navigate(location, option);
    };

    // Inline Components -----------------------------------------------------------
    const sheetHeader = () => (
        <View style={styles.sheetHeader}>
            <View style={styles.panelHeader}>
                <View style={styles.panelHandle} />
            </View>
        </View>
    );
    const sheetContent = () => (
        <View style={styles.sheetContent}>
            <View style={styles.sheetContentInner}>
                <TouchableOpacity style={styles.sheetBtns} onPress={() => setPermissions('camera')}>
                    <Text style={styles.sheetBtnsText}>Open Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sheetBtns}
                    onPress={() => setPermissions('library')}
                >
                    <Text style={styles.sheetBtnsText}>Open Library</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Effect-Bottom: For clicking the save button in the header --------------------
    useEffect(() => {
        navigation.setParams({ save: handleSaveBtn });
    }, [handleSaveBtn]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={100}
        >
            <ScrollView>
                <View style={styles.formWrap}>
                    <View style={styles.formControl}>
                        <TouchableOpacity
                            style={styles.imageWrap}
                            onPress={() => setBools('isVisible', true)}
                        >
                            <Image style={styles.image} source={{ uri: placeholderImg }} />
                        </TouchableOpacity>
                        <Button title="Change Image" onPress={() => setBools('isVisible', true)} />
                    </View>
                    <View style={styles.formControl}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={(val) => handleInputChange('title', val)}
                            keyboardType="default"
                            autoCapitalize="sentences"
                            returnKeyType="next"
                        />
                    </View>
                    <View style={styles.formControl}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={(val) => handleInputChange('price', val)}
                            keyboardType="decimal-pad"
                            returnKeyType="next"
                        />
                    </View>
                    <View style={styles.formControl}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.input}
                            value={description}
                            onChangeText={(val) => handleInputChange('description', val)}
                            keyboardType="default"
                            returnKeyType="done"
                        />
                    </View>
                </View>

                <View style={styles.mapWrap}>
                    <Text style={styles.label}>Location</Text>
                    {placeName !== '' && <Text>{placeName}</Text>}
                    <MapView
                        style={styles.mapContent}
                        loadingEnabled
                        initialRegion={{
                            latitude: 37.78825,
                            longitude: -122.4324,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        region={
                            longitude && latitude
                                ? {
                                      latitude,
                                      longitude,
                                      latitudeDelta: 0.0922,
                                      longitudeDelta: 0.0421,
                                  }
                                : null
                        }
                        onPress={(e) => onMapPressHandler(e.nativeEvent.coordinate)}
                    >
                        {longitude && latitude && (
                            <Marker
                                coordinate={{ latitude, longitude }}
                                title={title || 'Title Here'}
                                description={description || 'Description here...'}
                            />
                        )}
                    </MapView>
                </View>
            </ScrollView>

            <Modal animationType="slide" visible={isVisible} onDismiss={onDismiss} transparent>
                <View style={styles.sheetWrap}>
                    <BottomSheet
                        snapPoints={[220, 100, 0]}
                        initialSnap={0}
                        renderHeader={sheetHeader}
                        renderContent={sheetContent}
                        onCloseEnd={onDismiss}
                        enabledInnerScrolling={false}
                    />
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

// Styles for this EditProduct
const styles = StyleSheet.create({
    formWrap: {
        margin: 20,
    },
    formControl: {
        width: '100%',
    },
    label: {
        fontFamily: 'open-sans-bold',
        marginVertical: 8,
    },
    input: {
        paddingHorizontal: 2,
        paddingVertical: 5,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    imageWrap: {
        width: '92%',
        height: 200,
        marginLeft: 14,
        marginRight: 14,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#4b5a87',
        borderStyle: 'dashed',
    },
    image: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    sheetWrap: {
        flex: 1,
        backgroundColor: 'rgba(22,22,22,0.44)',
    },
    sheetHeader: {
        backgroundColor: '#dfe0ed',
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sheetContent: {
        backgroundColor: '#dfe0ed',
        padding: 15,
        height: 220,
    },
    sheetContentInner: {
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#f1f2ff',
        borderRadius: 12,
        paddingTop: 20,
    },
    sheetBtns: {
        width: '80%',
        height: 60,
        backgroundColor: Color.primary,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    sheetBtnsText: {
        color: 'white',
        fontSize: 18,
    },
    panelHeader: {
        alignItems: 'center',
    },
    panelHandle: {
        width: 40,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00000040',
        marginBottom: 10,
    },
    mapWrap: {
        margin: 20,
    },
    mapContent: {
        marginTop: 14,
        height: 320,
    },
});
