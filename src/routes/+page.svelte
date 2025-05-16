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

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Projects</h2>
      {#each resume.projects as project}
        <article class="border p-4 rounded-x1">
          <h3 class="font-semibold">{project.name}</h3>
          <p class="text-sm text-gray-500">{project.description}</p>
        </article>
      {/each}
  </section>

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Certifications</h2>
      {#each resume.certifications as certification}
        <article class="border p-4 rounded-x1">
          <h3 class="font-semibold">{certification.name}</h3>
          <p class="text-sm text-gray-500">{certification.authority}</p>
          <p class="text-sm text-gray-500">{certification.date}</p>
          <a href={certification.url} class="text-blue-500 hover:underline">Validate Certification</a>
        </article>
      {/each}
   </section>

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Certifications In Progress</h2>
      {#each resume.certificationInProgress as certificationInProgress}
        <article class="border p-4 rounded-x1">
          <h3 class="font-semibold">{certificationInProgress.name}</h3>
          <p class="text-sm text-gray-500">{certificationInProgress.date}</p>
        </article>
      {/each}
  </section>

  <section class="space-y-4">
    <h2 class="text-2xl font-semibold">Skills</h2>
    {#each resume.skills as skill}
      <article class="border p-4 rounded-x1">
        <h3 class="font-semibold">{skill.category}</h3>
        <ul class="list-disc pl-5">
          {#each skill.skills as item}
            <li>{item}</li>
          {/each}
      </article>
    {/each}
  </section>
</main>