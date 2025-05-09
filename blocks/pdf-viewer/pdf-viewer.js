const loadScript = () => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = "https://documentcloud.adobe.com/view-sdk/main.js";
  head.append(script);
  return script;
};

const loadClientId = async () => {
  try {
    const response = await fetch('http://localhost:3001/pdf-client-id');
    if (!response.ok) {
      throw new Error(`Failed to fetch Client Id: ${response.status}`);
    }

    const data = await response.json();
    if (!data.clientId) {
      throw new Error('Client Id not found in response');
    }

    return data.clientId;
  } catch (error) {
    console.error('PDF Viewer: Error initializing pdf viewer', error);
  }
};

export default async function decorate(block) {
  const [fileDiv, embedDiv] = [...block.children];
  const filePathContainer = fileDiv.querySelector('p');
  const filePath = filePathContainer ? filePathContainer.innerText : null;
  const embedContainer = embedDiv.querySelector('p');
  const embedMode = embedContainer ? embedContainer.innerText : "SIZED_CONTAINER";

  if (filePath) {
    loadScript();
    const clientId = await loadClientId();

    const pdfViewer = document.createElement('div');
    pdfViewer.id = "pdf-viewer";
    block.replaceChildren();
    block.append(pdfViewer);

    if (embedMode === 'IN_LINE') {
      block.style.height = "auto";
    }

    document.addEventListener("adobe_dc_view_sdk.ready", function() {
      var adobeDCView = new AdobeDC.View({
          clientId: clientId,
          divId: "pdf-viewer"
      });
      adobeDCView.previewFile({
          content: { location: { url: window.location.origin + filePath } },
          metaData: { fileName: filePath.split('/').pop() }
      }, { embedMode: embedMode });
    });
  }
}