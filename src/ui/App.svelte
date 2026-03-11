<script lang="ts">
	import Node from './components/Node.svelte';
	import Button from './components/Button.svelte';

	interface NodeInfo {
		id: string;
		name: string;
		page: {
			id: string;
			name: string;
		};
	}

	let component = $state<NodeInfo | null>(null);
	let error = $state<string | null>(null);
	let items = $state<NodeInfo[]>([]);
	let scanning = $state(false);
	let progress = $state(0);
	let selection = $state<string[]>([]);

	let nodes = $derived<NodeInfo[]>(
		component ? [component, ...items] : items
	);

	let itemsContainer: HTMLDivElement;

	const scan = () => {
		parent.postMessage({ pluginMessage: { type: 'scan' } }, '*');
	};

	const navigate = (nodeId: string, pageId: string) => {
		parent.postMessage({
			pluginMessage: {
				type: 'navigate',
				nodeId,
				pageId,
			}
		}, '*');
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		let selectedItem: Element | null = null;

		for (const element of itemsContainer.children) {
			if (element === document.activeElement) {
				selectedItem = element;
			}
		}

		if (!selectedItem) return;

		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
		}

		let sibling: Element | null = null;

		if (event.key === 'ArrowDown') {
			sibling = selectedItem.nextElementSibling;
		} else if (event.key === 'ArrowUp') {
			sibling = selectedItem.previousElementSibling;
		}

		if (sibling instanceof HTMLElement) {
			sibling.focus();
		}
	}

	const handleMessage = (event: MessageEvent) => {
		const msg = event.data.pluginMessage;

		if (!msg) return;

		if (msg.type === 'selection:change') {
			selection = msg.nodes;
		}

		if (msg.type === 'scan:start') {
			component = {
				id: msg.id,
				name: msg.name,
				page: msg.page,
			};
			error = null;
			items = [];
			scanning = true;
			progress = 0;
		}

		if (msg.type === 'scan:result') {
			items.push({
				id: msg.id,
				name: msg.name,
				page: msg.page,
			});
		}

		if (msg.type === 'scan:progress') {
			progress = msg.progress;
		}

		if (msg.type === 'scan:complete') {
			scanning = false;
			progress = 1;
		}

		if (msg.type === 'scan:error') {
			error = msg.message;
			scanning = false;
			progress = 1;
		}
	};
</script>

<svelte:window on:keydown={handleKeyDown} on:message={handleMessage} />

<div class="container">
	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="items" bind:this={itemsContainer}>
		{#each nodes as node}
			{@const navigateToNode = () => navigate(node.id, node.page.id)}
			<Node
				type={node === component ? 'component' : 'instance'}
				name={node.name}
				pageName={node.page.name}
				selected={selection.includes(node.id)}
				onfocus={navigateToNode}
				onclick={navigateToNode}
			/>
		{/each}
	</div>

	<footer>
		{#if scanning}
			<progress value={progress} max="1"></progress>
		{:else}
			<Button onclick={scan}>Scan</Button>
		{/if}
	</footer>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		flex-direction: column;
	}

	.error {
		background-color: var(--figma-color-bg-danger);
		color: var(--figma-color-text-danger);
		padding: 8px;
		border-radius: 4px;
	}

	footer {
		border-top: 1px solid var(--figma-color-border);
		display: flex;
		justify-content: flex-end;
		padding: 8px;
		width: 100%;
	}

	.items {
		align-self: stretch;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		gap: 2px;
		padding: 8px;
		width: 100%;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--figma-color-bg-tertiary) var(--figma-color-bg);
	}
</style>
