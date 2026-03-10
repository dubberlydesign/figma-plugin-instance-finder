<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	type Props = HTMLButtonAttributes

	let { children, ...restProps }: Props = $props();
</script>

<button class="Button" {...restProps}>
	{@render children?.()}
</button>

<style>
	button {
		display: block;
		border-radius: 5px;
		border: 1px solid var(--figma-color-border);
		padding: 0 7px;
		line-height: 22px;
		text-decoration: none;
		color: var(--figma-color-text);
	}
</style>
