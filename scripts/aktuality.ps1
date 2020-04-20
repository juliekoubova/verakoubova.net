function get-value($el) {
  if ($el -is [string]) {
    $el
  } else {
    $el.InnerXml
  }
}

([xml](gc ./cs/aktuality.html)).root.article `
| Sort-Object -Descending {(++$script:i)} `
|  select-Object `
  @{ N = 'title'; E = { get-value $_.h2 } }, `
  @{ N = 'text'; E = { get-value $_.p } } `
|% {
@"
- title:
    cs: $($_.title)
  cs: |
    $($_.text)

"@


}