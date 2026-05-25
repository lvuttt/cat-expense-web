<script lang="ts">
  import type { Snippet } from 'svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  import '../index.css';
  import '../App.css';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<ErrorBoundary>
  {@render children()}
</ErrorBoundary>
