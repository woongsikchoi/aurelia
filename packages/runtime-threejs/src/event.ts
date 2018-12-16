const getTime = () => {
  const time = performance.now();
  return time[0] * 1000000 + time[1] / 1000;
};

export interface EventInitDict {
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
}

const defaultEventInitDict: EventInitDict = {
  bubbles: false,
  cancelable: false,
  composed: false
};

// interface Event // https://dom.spec.whatwg.org/#event
export class Event {

  public static readonly NONE = 0;
  public static readonly CAPTURING_PHASE = 1;
  public static readonly AT_TARGET = 2;
  public static readonly BUBBLING_PHASE = 3;

  public type: string;
  public bubbles: boolean;
  public cancelable: boolean;
  public defaultPrevented: boolean;
  public cancelBubble: boolean;
  public cancelImmediateBubble: boolean;
  public eventPhase: 0 | 1 | 2 | 3;
  public isTrusted: boolean;
  public composed: boolean;
  public timeStamp: number;

  public target: any;
  public currentTarget: any;

  constructor(type?: string, eventInitDict: EventInitDict = defaultEventInitDict) {
    if (type) {
      this.initEvent(
        type,
        eventInitDict.bubbles,
        eventInitDict.cancelable
      );
    }
    this.composed = eventInitDict.composed;
    this.isTrusted = false;
    this.defaultPrevented = false;
    this.cancelBubble = false;
    this.cancelImmediateBubble = false;
    this.eventPhase = Event.NONE;
    this.timeStamp = getTime();
  }

  public initEvent(type: string, bubbles: boolean, cancelable: boolean) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
  }

  public stopPropagation() {
    this.cancelBubble = true;
  }

  public stopImmediatePropagation() {
    this.cancelBubble = true;
    this.cancelImmediateBubble = true;
  }

  public preventDefault() {
    this.defaultPrevented = true;
  }
}
