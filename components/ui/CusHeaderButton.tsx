import React from 'react'
import { StyleSheet, Platform } from 'react-native'
import { HeaderButton } from "react-navigation-header-buttons";
import { Ionicons } from '@expo/vector-icons';

import Color from "../../defaults/Color";

interface Props {
    props: any;
}

export default function CusHeaderButton(props: Props) {
    return (
      <HeaderButton
          {...props}
          IconComponent={Ionicons}
          iconSize={23}
          color={Platform.OS === 'android' ? 'white' : Color.primary}
      />
    )
}

// Styles for this CusHeaderButton
const styles = StyleSheet.create({
    mainWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
