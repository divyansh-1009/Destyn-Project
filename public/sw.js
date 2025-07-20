// Service Worker for Push Notifications
self.addEventListener("push", function (event) {
  const options = {
    body: event.data ? event.data.text() : "You have a new message!",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Message",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192x192.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Dating App", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/mainpage"));
  }
});

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("dating-app-v1").then(function (cache) {
      return cache.addAll([
        "/",
        "/mainpage",
        "/icon-192x192.png",
        "/badge-72x72.png",
      ]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
