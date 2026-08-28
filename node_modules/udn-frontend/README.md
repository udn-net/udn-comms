# udn-frontend

TypeScript library for [UDN](https://github.com/marlon-erler/universal-decentralized-network) apps

# Install

`npm install udn-frontend`

# Usage

```TypeScript
import UDNFrontend from "udn-frontend";

// setup
const UDN = new UDNFrontend();

// connect
UDN.onconnect = () => {
  console.log("connected!");
};
UDN.ondisconnect = () => {
  console.log("disconnected!");
};

UDN.connect("ws://192.168.0.69:1234");
UDN.disconnect();

// messages
UDN.onmessage = (data: Message) => {
  console.log(data);
};

UDN.sendMessage("my-channel", "Hello, world!");

// subscribe
UDN.subscribe("my-channel");
UDN.unsubscribe("my-channel");

// mailbox
UDN.onmailboxcreate = (mailboxId: string) => {
  UDN.connectMailbox(mailboxId);
}
UDN.onmailboxconnect = (mailboxId: string) => {
  UDN.deleteMailbox(mailboxId);
}
UDN.onmailboxdelete = (mailboxId: string) => {
  console.log("mailbox deleted");
}

UDN.requestMailbox();
```

# Changelog

## 1.0.5

- add mailbox support

## 1.0.6

- add error handling with `connect()`
- add `onmailboxdelete` listener

## 1.0.7

- add `uuid` property to Message

## 1.0.8

- fix bug where messages would be considered sent even if the WebSocket is not ready

## 1.0.9

- send confirmation to server that a message was received, necessary for mailboxes to function safely