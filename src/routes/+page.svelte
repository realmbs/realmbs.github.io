<script lang="ts">
  import resume from '$lib/data.json' assert { type: 'json' };
</script>

<main class="max-w-3xl mx-auto p-8 space-y-10">
  <header class="text-center space-y-2">
    <h1 class="text-4xl font-bold">{ resume.name }</h1>
    <p class="text-lg text-gray-500">{ resume.headline }</p>
    <div class="flex justify-center gap-4 text-sm text-gray-600">
      <a href="mailto:{ resume.contact.email }">{ resume.contact.email }</a>
      <span>{ resume.contact.linkedin }</span>
      <span>{ resume.contact.github }</span>
      <span>{ resume.contact.location }</span>
    </div>
  </header>

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Summary</h2>
    <p>{ resume.summary }</p>
  </section>

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Education</h2>
      {#each resume.education as education}
        <article class="border p-4 rounded-x1">
          <h3 class="font-semibold">{education.degree} - {education.institution}</h3>
          <p class="text-sm text-gray-500">{education.startDate} - {education.endDate}</p>
          <p class="text-sm text-gray 500">GPA: {education.gpa} | {education.honors ? `${education.honors}` : ''}</p>
        </article>
      {/each}
  </section>
</main>