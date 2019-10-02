# nodejs bitcoin wallet
## [experimental] funds can be "lost".

![Alt text](resources/screenshot.png)


1. download

```
git clone https://github.com/gianlucamazza/nodejs-bitcoin-wallet.git
```

2. install dependencies

```
cd nodejs-bitcoin-wallet
npm install
```

3. copy the configuration file:

```
cp config.json.template config.json
```

4. run the wallet, if not present a bip32 wallet will be generated:
```
npm start
```

## development roadmap
- sweep private key
- multisig transactions
- hardware wallet integration
  - trezor
  - ledger
  - coldcard
- lightning integration

## support the development
Bitcoin donations: bc1q7uauxxrumjg8pg5pr543gazrjtvyrcmxjyxks2
