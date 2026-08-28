export interface Message {
  uuid?: string; // to be assigned by

  // connecting to server
  requestingServerConnection?: boolean;

  // mailbox
  requestingMailboxSetup?: boolean;
  requestedMailbox?: string;
  deletingMailbox?: string;
  assignedMailboxId?: string; // sent by server
  connectedMailboxId?: string; // sent by server
  deletedMailbox?: string; // sent by server

  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;
  subscribed?: boolean; // sent by server

  // sending message
  messageChannel?: string;
  messageBody?: string;

  // confirming message
  confirmingMessageReceived?: boolean;
}

export default class UDNFrontend {
  ws: WebSocket | undefined;

  // HANDLERS
  private connectionHandler = () => { };
  private disconnectionHandler = () => { };
  private messageHandler = (data: Message) => { };
  private mailboxHandler = (mailboxId: string) => { };
  private mailboxConnectionHandler = (mailboxId: string) => { };
  private mailboxDeleteHandler = (mailboxId: string) => { };

  // INIT
  set onconnect(handler: () => void) {
    this.connectionHandler = handler;
  }
  set ondisconnect(handler: () => void) {
    this.disconnectionHandler = handler;
  }
  set onmessage(handler: (data: Message) => void) {
    this.messageHandler = handler;
  }
  set onmailboxcreate(handler: (mailboxId: string) => void) {
    this.mailboxHandler = handler;
  }
  set onmailboxconnect(handler: (mailboxId: string) => void) {
    this.mailboxConnectionHandler = handler;
  }
  set onmailboxdelete(handler: (mailboxId: string) => void) {
    this.mailboxDeleteHandler = handler;
  }

  // UTILITY METHODS
  private send(messageObject: Message): boolean {
    if (this.ws == undefined) return false;
    if (this.ws.readyState != 1) return false;

    const messageString = JSON.stringify(messageObject);
    this.ws.send(messageString);
    return true;
  }

  // PUBLIC METHODS
  // connection
  connect(address: string): void {
    try {
      this.disconnect();

      this.ws = new WebSocket(address);
      this.ws.addEventListener("open", this.connectionHandler);
      this.ws.addEventListener("close", this.disconnectionHandler);
      this.ws.addEventListener("message", (message) => {
        const dataString = message.data.toString();
        const data = JSON.parse(dataString);

        if (data.assignedMailboxId) {
          return this.mailboxHandler(data.assignedMailboxId);
        } else if (data.connectedMailboxId) {
          return this.mailboxConnectionHandler(data.connectedMailboxId);
        } else if (data.deletedMailbox) {
          return this.mailboxDeleteHandler(data.deletedMailbox);
        } else {
          this.send({ uuid: data.uuid, confirmingMessageReceived: true });
          this.messageHandler(data);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  disconnect(): void {
    this.ws?.close();
  }

  // message
  sendMessage(channel: string, body: string): boolean {
    const messageObject = {
      messageChannel: channel,
      messageBody: body,
    };
    return this.send(messageObject);
  }

  // subscription
  subscribe(channel: string): boolean {
    const messageObject = {
      subscribeChannel: channel,
    };
    return this.send(messageObject);
  }

  unsubscribe(channel: string): boolean {
    const messageObject = {
      unsubscribeChannel: channel,
    };
    return this.send(messageObject);
  }

  // mailbox
  requestMailbox(): boolean {
    const messageObject = {
      requestingMailboxSetup: true,
    };
    return this.send(messageObject);
  }

  connectMailbox(mailboxId: string): boolean {
    const messageObject = {
      requestedMailbox: mailboxId,
    };
    return this.send(messageObject);
  }

  deleteMailbox(mailboxId: string): boolean {
    const messageObject = {
      deletingMailbox: mailboxId,
    };
    return this.send(messageObject);
  }
}
