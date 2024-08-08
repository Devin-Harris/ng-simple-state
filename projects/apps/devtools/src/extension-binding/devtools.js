let youClickedOn;
chrome.devtools.panels.create(
   'NGXSS Devtools',
   null,
   '../index.html',
   (panel) => {
      panel.onShown.addListener((extPanelWindow) => {
         youClickedOn = extPanelWindow.document.querySelector('#youClickedOn');
      });
   }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   // Messages from content scripts should have sender.tab set
   if (sender.tab && request.click == true) {
      console.log('I am here!');

      if (youClickedOn) {
         youClickedOn.innerHTML = `You clicked on position (${request.xPosition}, ${request.yPosition}) in the inspected page.`;
      }

      sendResponse({
         xPosition: request.xPosition,
         yPosition: request.yPosition,
      });
   }
});

// Create a connection to the background service worker
const backgroundPageConnection = chrome.runtime.connect({
   name: 'devtools-page',
});

// Relay the tab ID to the background service worker
backgroundPageConnection.postMessage({
   name: 'init',
   tabId: chrome.devtools.inspectedWindow.tabId,
});
