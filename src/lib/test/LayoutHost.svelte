<script lang="ts">
  import Layout from '../../routes/+layout.svelte';
</script>

<Layout>
  {#snippet children()}
    <main data-testid="page-content">Page body</main>
  {/snippet}
</Layout>
