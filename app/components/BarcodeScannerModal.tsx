import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;
    permissionGranted: boolean;
    onBarcodeScanned: (result: { type: string; data: string }) => void;
};

export default function BarcodeScannerModal({
    visible,
    onClose,
    permissionGranted,
    onBarcodeScanned,
}: Props) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                {/* Header */}
                <View style={styles.scannerHeader}>
                    <TouchableOpacity 
                        onPress={onClose} 
                        style={styles.scannerBackButton}
                    >
                        <Ionicons name="chevron-back" size={32} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.scannerTitle}>Scan Barcodes</Text>
                </View>

                {/* Instructions */}
                <View style={styles.scannerInstructions}>
                    <Text style={styles.scannerInstructionsText}>
                        Place Barcode within scanning area
                    </Text>
                </View>

                {/* Camera - NO CHILDREN INSIDE */}
                {permissionGranted && (
                    <CameraView
                        style={{ flex: 1 }}
                        facing="back"
                        onBarcodeScanned={onBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: [
                                'qr',
                                'ean13',
                                'ean8',
                                'upc_a',
                                'upc_e',
                                'code128',
                                'code39',
                            ],
                        }}
                    />
                )}

                {/* Scanning Frame Overlay - MOVED OUTSIDE as sibling with absolute positioning */}
                {permissionGranted && (
                    <View style={styles.scannerOverlay}>
                        <View style={styles.scannerFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#36AF27',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
        zIndex: 10,  // ← Add zIndex to keep header above overlay
    },
    scannerBackButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        zIndex: 1,
    },
    scannerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scannerInstructions: {
        backgroundColor: '#5A5A5A',
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        zIndex: 10,  // ← Add zIndex to keep instructions above overlay
    },
    scannerInstructionsText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '500',
    },
    scannerOverlay: {
        position: 'absolute',  // ← Make overlay absolute
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',  // ← Allow touches to pass through to camera
    },
    scannerFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#36AF27',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
});
