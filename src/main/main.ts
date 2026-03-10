interface NodeInfo {
  id: string;
  name: string;
  page: {
	id: string;
	name: string;
  };
}

async function scan() {
  console.log('scanning...')
  const currentPage = figma.currentPage;
  const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({ type: 'scan:error', message: 'Select a component or instance first.' });
      return;
    }

    if (selection.length > 1) {
      figma.ui.postMessage({ type: 'scan:error', message: 'Select only one component or instance.' });
      return;
    }

    const node = selection[0];
    
    if (node.type !== 'COMPONENT') {
      figma.ui.postMessage({ type: 'scan:error', message: 'Selection is not a component.' });
      return;
    }

	figma.ui.postMessage({
		type: 'scan:start',
		id: node.id,
		name: node.name,
		page: {
			id: currentPage.id,
			name: currentPage.name,
		}
	});
	
	let scannedPages = 0;
	let progress = 0;

    for (const page of figma.root.children) {	  
      await page.loadAsync();
      const instances = page.findAllWithCriteria({ types: ['INSTANCE'] })
      
      for (const index in instances) {
		const instance = instances[index];
        const main = await instance.getMainComponentAsync();
        if (main?.id === node.id) {
          console.log('instance found', instance.name);
          figma.ui.postMessage({
			type: 'scan:result',
            id: instance.id,
            name: instance.name,
            page: {
				id: page.id,
				name: page.name,
			},
          });
		//   figma.ui.postMessage({
		// 	type: 'scan:progress',
		// 	progress: scannedPages / figma.root.children.length,
		//   })
        }
      };

	  scannedPages++;
	  progress = scannedPages / figma.root.children.length

	  figma.ui.postMessage({
		type: 'scan:progress',
		progress,
	  })
    }

    figma.ui.postMessage({
      type: 'scan:complete'
    });
}

async function navigate(nodeId: string, pageId: string) {
  const page = figma.root.children.find(p => p.id === pageId);

  if (!page) {
    figma.ui.postMessage({ type: 'error', message: 'Page not found. Try scanning again.' });
    return;
  }

  await figma.setCurrentPageAsync(page);

  const node = page.findOne(n => n.id === nodeId);
  if (!node) {
    figma.ui.postMessage({ type: 'error', message: 'Node not found. It may have been deleted. Try scanning again.' });
    return;
  }

  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
}

interface PluginMessageScan {
  type: 'scan';
}

interface PluginMessageNavigate {
  type: 'navigate';
  nodeId: string;
  pageId: string;
}

type PluginMessage = PluginMessageScan | PluginMessageNavigate;

figma.ui.onmessage = async (msg: PluginMessage) => {
  switch (msg.type) {
    case 'scan': {
      return scan();
    }

    case 'navigate': {
      return navigate(msg.nodeId, msg.pageId);
    }
  }
};

figma.on('selectionchange', () => {
	figma.ui.postMessage({
		type: 'selection:change',
		nodes: figma.currentPage.selection.map(node => node.id)
	  });                                                                                                                            
  }); 

export default function () {
	figma.showUI(__html__, { width: 300, height: 260, themeColors: true });
	figma.skipInvisibleInstanceChildren = true;
}