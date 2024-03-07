json:{
  "chapter": "//*[((name()='h1' or name()='h2') and re:test(., '\\s*((chapter|book|section|part)\\s+)|((prolog|prologue|epilogue)(\\s+|$))', 'i')) or @class = 'chapter']",
  "chapter_mark": "pagebreak",
  "start_reading_at": null,
  "remove_first_image": false,
  "remove_fake_margins": true,
  "insert_metadata": false,
  "page_breaks_before": "//*[name()='h1' or name()='h2']"
}