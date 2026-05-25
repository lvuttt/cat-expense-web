<script lang="ts">
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
</script>

<ErrorBoundary>
  {#snippet children()}
    <p data-testid="child-content">Child content</p>
  {/snippet}
</ErrorBoundary>
