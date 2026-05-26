<script lang="ts">
  import { createVirtualList } from '../state/virtualList.svelte';

  interface Props {
    getItems: () => readonly unknown[];
    getItemId: (item: unknown) => string;
    defaultHeight: number;
    buffer?: number;
    testFn: (list: ReturnType<typeof createVirtualList<unknown>>) => void;
  }

  // svelte-ignore state_referenced_locally
  let {
    getItems,
    getItemId,
    defaultHeight,
    buffer = 5,
    testFn,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  const list = createVirtualList(getItems, getItemId, defaultHeight, buffer);

  // svelte-ignore state_referenced_locally
  testFn(list as ReturnType<typeof createVirtualList<unknown>>);
</script>
