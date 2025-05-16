<script lang="ts">
  import resume from '$lib/data.json' assert { type: 'json' };;
</script>

<main class="max-w-3xl mx-auto p-8 space-y-10">
  <header class="text-center space-y-2">
    <h1 class="text-4xl font-bold">{ resume.name }</h1>
    <p class="text-lg text-gray-500">{ resume.headline }</p>
    <div class="flex justify-center gap-4 text-sm text-gray-600">
      <a href="mailto:{ resume.contact.email }">{ resume.contact.email }</a>
      <span>{ resume.contact.location }</span>
    </div>
  </header>

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Summary</h2>
    <p>{ resume.summary }</p>
  </section>

</main>