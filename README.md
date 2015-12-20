# sg-drawer

Curretly left side works. Under development

```html
<link rel="stylesheet" type="text/css" href="css/sgdrawer.css">
```

```html
<script src="js/sgdrawer.js"></script>
```

```html
...
<sg-drawer side="'left'" open="open" fixed="false" duration="300" padding="250" template-url="modules/app/views/sg-sample-drawer-menu.html"></sg-drawer>
...
```

### Options
``side``: 'left' or 'right'. Default value: 'true'

``fixed``: true or false // fixed menu or drawer menu. Default value: false

``panel``: document id of right side panel in case of fixed: true

``duration``: drawer animation speed in milliseconds

``padding``: width of the drawer menu

``z-index``: optional z-index of drawer to make it on top of other elements. Default value: '99999'

``open``: true or false. Dynamic flag to open/close the drawer. Default value: false
