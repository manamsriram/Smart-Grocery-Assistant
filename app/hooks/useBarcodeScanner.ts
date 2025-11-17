import { useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert } from "react-native";

type BarcodeResult = {
  type: string;
  data: string;
};

type UseBarccodeScannerOptions = {
  onProductFound: (product: {
    name: string;
    category: string;
    quantity: string;
    unit: string;
    price: string;
    expirationDate: string;
  }) => Promise<void>;
  onProductNotFound?: (barcode: string) => void;
  onError?: (error: Error) => void;
};

function formatCategoryName(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function useBarcodeScanner(options: UseBarccodeScannerOptions) {
  const { onProductFound, onProductNotFound, onError } = options;
  
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);

  const openScanner = async () => {
    scanLockRef.current = false;

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Please enable camera access to scan barcodes."
        );
        return;
      }
    }

    setScannerVisible(true);
  };

  const handleBarCodeScanned = async ({ type, data }: BarcodeResult) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    setScannerVisible(false);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data}.json`
      );
      const result = await response.json();

      if (result.status === 1) {
        const product = result.product;

        const rawCategory = product.categories_tags?.[0]?.replace("en:", "") || "other";
        const formattedCategory = formatCategoryName(rawCategory);

        const newItem = {
          name: product.product_name || "Unknown Product",
          category: formattedCategory, 
          quantity: "1",
          unit: "",
          price: "",
          expirationDate: "",
        };

        await onProductFound(newItem);
        return;
      }

      // Product not found
      if (onProductNotFound) {
        onProductNotFound(data);
      } else {
        setTimeout(() => {
          Alert.alert(
            "Not Found",
            `Barcode: ${data}\nThis item is not in the database.`,
            [{ text: "OK", onPress: () => { scanLockRef.current = false; } }]
          );
        }, 500);
      }
    } catch (error) {
      console.error("Scan error:", error);
      if (onError) {
        onError(error as Error);
      } else {
        setTimeout(() => {
          Alert.alert(
            "Error",
            "Unable to scan barcode. Try again.",
            [{ text: "OK", onPress: () => { scanLockRef.current = false; } }]
          );
        }, 500);
      }
    }
  };

  const closeScanner = () => {
    setScannerVisible(false);
    scanLockRef.current = false;
  };

  return {
    scannerVisible,
    permission,
    openScanner,
    handleBarCodeScanned,
    closeScanner,
    resetLock: () => { scanLockRef.current = false; },
  };
}
