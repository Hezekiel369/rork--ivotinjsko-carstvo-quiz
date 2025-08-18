# Životinjsko Carstvo Quiz

Mobilna kviz aplikacija o životinjama optimizovana za Android i iOS platforme.

## Android Test Instrukcije

Za testiranje Android verzije aplikacije:

### Metoda 1: Expo Go QR kod
1. Instaliraj Expo Go aplikaciju na Android telefon
2. Pokreni aplikaciju sa `npm start`
3. Skeniraj QR kod sa Expo Go aplikacijom

### Metoda 2: Tunnel povezivanje
1. Pokreni sa tunnel flagom: `npm start -- --tunnel`
2. Koristi exp:// URL u Expo Go aplikaciji

### Metoda 3: Manuelno upisivanje
Ako QR kod ne radi, možeš manuelno upisati:
```
exp://exp.host/@anonymous/zz101yxhb1hzomt0juxfm
```

## Optimizacije za Android

- Isključen audio za stabilnost
- Optimizovane slike (manje veličine)
- Pojednostavljeno AsyncStorage rukovanje
- Uklonjen splash screen handling
- Error boundary za crash recovery

## Poznati problemi

- Android verzija može imati probleme sa remote update-ima
- Audio efekti su isključeni na Android-u za stabilnost
- Slike se učitavaju u manjoj rezoluciji na Android-u

## Platforme

- ✅ Web (desktop)
- ✅ iOS 
- ⚠️ Android (optimizovano za stabilnost)