{
  const view = document.getElementById('one');
  view.build([
    {title: 'first'},
    {title: 'two'},
    {title: 'three'},
    {title: '1 / This is a Long Text', checked: true},
    {title: '2 / This is a Long Text', checked: true},
    {title: '3 / This is a Long Text'},
    {title: '4 / This is a Long Text'},
    {title: '5 / This is a Long Text'},
    {title: '6 / This is a Long Text'},
    {title: '7 / This is a Long Text'},
    {title: 'This is a Long Text'},
    {title: 'last'}
  ]);
}
{
  const view = document.getElementById('two');
  view.build();
}
{
  const view = document.getElementById('three');
  view.build([
    {title: 'item █'},
    {title: 'item ⧉'},
    {title: 'item ╬'},
    {title: 'item ⧅'}
  ]);
}
{
  const view = document.getElementById('four');
  view.build([
    {title: 'one', id: {
      a: 1,
      b: 2
    }},
    {title: 'two', id: 2},
    {title: 'three', id: 3}
  ]);
  const update = () => document.getElementById('selected').textContent = JSON.stringify(view.value);
  view.addEventListener('change', update);
  update();
}
