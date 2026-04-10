import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: "2123020",
  key: "f6cbcfdb2495ab9022f2",
  secret: "a6aeb7848e9f4ee99f6e",
  cluster: "ap1",
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient("f6cbcfdb2495ab9022f2", {
      cluster: "ap1",
    });
  }
  return pusherClientInstance;
};

// Channel & event constants
export const VISIT_CHANNEL = "visits";
export const VISIT_BOOKED_EVENT = "visit-booked";
export const VISIT_STATUS_CHANGED_EVENT = "visit-status-changed";
export const VISIT_DELEGATION_NEW_EVENT = "visit-delegation-new";
