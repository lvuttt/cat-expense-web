<script lang="ts">
  import { createExpenses } from '../state/expenses.svelte';
  import type { IStorageService } from '../services/storageService';
  import type { Expense } from '../types/models';

  interface Props {
    storage: IStorageService<Expense[]>;
    testFn: (store: ReturnType<typeof createExpenses>) => void;
  }

  // svelte-ignore state_referenced_locally
  let { storage, testFn }: Props = $props();

  // svelte-ignore state_referenced_locally
  const store = createExpenses(storage);

  // svelte-ignore state_referenced_locally
  testFn(store);
</script>
