import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  color: string;
}

export default function ConfettiView() {
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
    
    for (let i = 0; i < 30; i++) {
      const piece: ConfettiPiece = {
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(-50),
        rotate: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      
      confettiPieces.current.push(piece);
      
      Animated.parallel([
        Animated.timing(piece.y, {
          toValue: height + 50,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {confettiPieces.current.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  confettiPiece: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});