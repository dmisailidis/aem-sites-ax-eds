const loadScript = () => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = "https://documentcloud.adobe.com/view-sdk/main.js";
  head.append(script);
  return script;
};

export default function decorate(block) {
  const [fileDiv] = [...block.children];
  const filePathContainer = fileDiv.querySelector('p');
  const filePath = filePathContainer ? filePathContainer.innerText : null;

  if (filePath) {
    loadScript();

    const pdfViewer = document.createElement('div');
    pdfViewer.id = "pdf-viewer";
    block.replaceChildren();
    block.append(pdfViewer);

    document.addEventListener("adobe_dc_view_sdk.ready", function() {
      var adobeDCView = new AdobeDC.View({
          clientId: "30dc4a499b344bb08b65c0565d550089",
          divId: "pdf-viewer"
      });
      adobeDCView.previewFile({
          content: { location: { url: window.location.origin + filePath } },
          metaData: { fileName: "Sample.pdf" }
      }, { embedMode: "SIZED_CONTAINER" });
    });
  }
}