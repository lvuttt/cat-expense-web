<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../index.css';
  import '../App.scss';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

{@render children()}
