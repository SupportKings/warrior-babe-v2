---
title: Combobox
subtitle: An input combined with a list of predefined items to select.
description: A high-quality, unstyled React combobox component that renders an input combined with a list of predefined items to select.
---

# Combobox

A high-quality, unstyled React combobox component that renders an input combined with a list of predefined items to select.

## Demo

### Tailwind

This example shows how to implement the component using Tailwind CSS.

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';

export default function ExampleCombobox() {
  const id = React.useId();
  return (
    <Combobox.Root items={fruits}>
      <div className="relative flex flex-col gap-1 text-sm leading-5 font-medium text-gray-900">
        <label htmlFor={id}>Choose a fruit</label>
        <Combobox.Input
          placeholder="e.g. Apple"
          id={id}
          className="h-10 w-64 rounded-md font-normal border border-gray-200 pl-3.5 text-base text-gray-900 bg-[canvas] focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
        />
        <div className="absolute right-2 bottom-0 flex h-10 items-center justify-center text-gray-600">
          <Combobox.Clear
            className="flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
            aria-label="Clear selection"
          >
            <ClearIcon className="size-4" />
          </Combobox.Clear>
          <Combobox.Trigger
            className="flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
            aria-label="Open popup"
          >
            <ChevronDownIcon className="size-4" />
          </Combobox.Trigger>
        </div>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No fruits found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item
                  key={item}
                  value={item}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{item}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function ClearIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const fruits = [
  'Apple',
  'Banana',
  'Orange',
  'Pineapple',
  'Grape',
  'Mango',
  'Strawberry',
  'Blueberry',
  'Raspberry',
  'Blackberry',
  'Cherry',
  'Peach',
  'Pear',
  'Plum',
  'Kiwi',
  'Watermelon',
  'Cantaloupe',
  'Honeydew',
  'Papaya',
  'Guava',
  'Lychee',
  'Pomegranate',
  'Apricot',
  'Grapefruit',
  'Passionfruit',
];
```

### CSS Modules

This example shows how to implement the component using CSS Modules.

```css
/* index.module.css */
.Input {
  box-sizing: border-box;
  padding-left: 0.875rem;
  margin: 0;
  border: 1px solid var(--color-gray-200);
  width: 16rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: canvas;
  color: var(--color-gray-900);

  &:focus {
    outline: 2px solid var(--color-blue);
    outline-offset: -1px;
  }
}

.Label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--color-gray-900);
  position: relative;
}

.ActionButtons {
  --size: 1.5rem;
  box-sizing: border-box;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
  height: 2.5rem;
  right: 0.5rem;
  border-radius: 0.25rem;
  border: none;
  color: var(--color-gray-600);
  padding: 0;
}

.Trigger,
.Clear {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: 2.5rem;
  color: var(--color-gray-600);
  border: none;
  padding: 0;
  border-radius: 0.25rem;
  background: none;
}

.ClearIcon,
.TriggerIcon {
  width: 1rem;
  height: 1rem;
}

.Positioner {
  outline: 0;
}

.Popup {
  box-sizing: border-box;
  padding-block: 0.5rem;
  border-radius: 0.375rem;
  background-color: canvas;
  color: var(--color-gray-900);
  width: var(--anchor-width);
  max-height: min(var(--available-height), 23rem);
  max-width: var(--available-width);
  overflow-y: auto;
  scroll-padding-block: 0.5rem;
  overscroll-behavior: contain;
  transition:
    opacity 0.1s,
    transform 0.1s;
  transform-origin: var(--transform-origin);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.95);
  }

  @media (prefers-color-scheme: light) {
    outline: 1px solid var(--color-gray-200);
    box-shadow:
      0 10px 15px -3px var(--color-gray-200),
      0 4px 6px -4px var(--color-gray-200);
  }

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
    outline-offset: -1px;
  }
}

.Item {
  box-sizing: border-box;
  outline: 0;
  cursor: default;
  user-select: none;
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  display: grid;
  gap: 0.5rem;
  align-items: center;
  grid-template-columns: 0.75rem 1fr;
  font-size: 1rem;
  line-height: 1rem;

  &[data-highlighted] {
    z-index: 0;
    position: relative;
    color: var(--color-gray-50);
  }

  &[data-highlighted]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.5rem;
    border-radius: 0.25rem;
    background-color: var(--color-gray-900);
  }
}

.ItemText {
  grid-column-start: 2;
}

.ItemIndicator {
  grid-column-start: 1;
}

.ItemIndicatorIcon {
  display: block;
  width: 0.75rem;
  height: 0.75rem;
}

.Empty:not(:empty) {
  font-size: 0.925rem;
  line-height: 1rem;
  color: var(--color-gray-600);
  padding: 0.5rem 1rem;
}
```

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import styles from './index.module.css';

export default function ExampleCombobox() {
  const id = React.useId();
  return (
    <Combobox.Root items={fruits}>
      <div className={styles.Label}>
        <label htmlFor={id}>Choose a fruit</label>
        <div className={styles.InputWrapper}>
          <Combobox.Input placeholder="e.g. Apple" id={id} className={styles.Input} />
          <div className={styles.ActionButtons}>
            <Combobox.Clear className={styles.Clear} aria-label="Clear selection">
              <ClearIcon className={styles.ClearIcon} />
            </Combobox.Clear>
            <Combobox.Trigger className={styles.Trigger} aria-label="Open popup">
              <ChevronDownIcon className={styles.TriggerIcon} />
            </Combobox.Trigger>
          </div>
        </div>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className={styles.Positioner} sideOffset={4}>
          <Combobox.Popup className={styles.Popup}>
            <Combobox.Empty className={styles.Empty}>No fruits found.</Combobox.Empty>
            <Combobox.List className={styles.List}>
              {(item: string) => (
                <Combobox.Item key={item} value={item} className={styles.Item}>
                  <Combobox.ItemIndicator className={styles.ItemIndicator}>
                    <CheckIcon className={styles.ItemIndicatorIcon} />
                  </Combobox.ItemIndicator>
                  <div className={styles.ItemText}>{item}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function ClearIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const fruits = [
  'Apple',
  'Banana',
  'Orange',
  'Pineapple',
  'Grape',
  'Mango',
  'Strawberry',
  'Blueberry',
  'Raspberry',
  'Blackberry',
  'Cherry',
  'Peach',
  'Pear',
  'Plum',
  'Kiwi',
  'Watermelon',
  'Cantaloupe',
  'Honeydew',
  'Papaya',
  'Guava',
  'Lychee',
  'Pomegranate',
  'Apricot',
  'Grapefruit',
  'Passionfruit',
];
```

## Usage guidelines

- **Combobox is a filterable Select**: Use Combobox when the input is restricted to a set of predefined selectable items, similar to [Select](/react/components/select.md) but whose items are filterable using an input. Prefer using Combobox over Select when the number of items is sufficiently large to warrant filtering.
- **Avoid for simple search widgets**: Combobox does not allow free-form text input. For search widgets, consider using [Autocomplete](/react/components/autocomplete.md) instead.

## Anatomy

Import the components and place them together:

```jsx title="Anatomy"
import { Combobox } from '@base-ui-components/react/combobox';

<Combobox.Root>
  <Combobox.Input />
  <Combobox.Trigger />
  <Combobox.Icon />
  <Combobox.Clear />
  <Combobox.Value />

  <Combobox.Chips>
    <Combobox.Chip>
      <Combobox.ChipRemove />
    </Combobox.Chip>
  </Combobox.Chips>

  <Combobox.Portal>
    <Combobox.Backdrop />
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Arrow />

        <Combobox.Status />
        <Combobox.Empty />

        <Combobox.List>
          <Combobox.Row>
            <Combobox.Item>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          </Combobox.Row>

          <Combobox.Separator />

          <Combobox.Group>
            <Combobox.GroupLabel />
          </Combobox.Group>

          <Combobox.Collection />
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>;
```

## API reference

### Root

Groups all parts of the combobox.
Doesn't render its own HTML element.

**Root Props:**

| Prop                                                                   | Type                                                                                                                 | Default | Description                                                                                                                                                                                                                                                                   |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                                                                   | `string`                                                                                                             | -       | Identifies the field when a form is submitted.                                                                                                                                                                                                                                |
| defaultValue                                                           | `SelectedValue[] \| SelectedValue \| null`                                                                           | -       | The uncontrolled selected value of the combobox when it's initially rendered.To render a controlled combobox, use the `value` prop instead.                                                                                                                                   |
| value                                                                  | `SelectedValue[] \| SelectedValue`                                                                                   | -       | The selected value of the combobox. Use when controlled.                                                                                                                                                                                                                      |
| onValueChange                                                          | `((value: SelectedValue[] \| SelectedValue, eventDetails: Combobox.Root.ChangeEventDetails) => void)`                | -       | Callback fired when the selected value of the combobox changes.                                                                                                                                                                                                               |
| defaultOpen                                                            | `boolean`                                                                                                            | `false` | Whether the popup is initially open.To render a controlled popup, use the `open` prop instead.                                                                                                                                                                                |
| open                                                                   | `boolean`                                                                                                            | -       | Whether the popup is currently open.                                                                                                                                                                                                                                          |
| onOpenChange                                                           | `((open: boolean, eventDetails: Combobox.Root.ChangeEventDetails) => void)`                                          | -       | Event handler called when the popup is opened or closed.                                                                                                                                                                                                                      |
| actionsRef                                                             | `RefObject<Combobox.Root.Actions>`                                                                                   | -       | A ref to imperative actions.\* `unmount`: When specified, the combobox will not be unmounted when closed.&#xA;Instead, the `unmount` function must be called to unmount the combobox manually.&#xA;Useful when the combobox's animation is controlled by an external library. |
| cols                                                                   | `number`                                                                                                             | `1`     | The maximum number of columns present when the items are rendered in grid layout.&#xA;A value of more than `1` turns the listbox into a grid.                                                                                                                                 |
| defaultInputValue                                                      | `string \| number \| string[]`                                                                                       | -       | The uncontrolled input value when initially rendered.                                                                                                                                                                                                                         |
| filter                                                                 | `((itemValue: any, query: string, itemToStringLabel: ((itemValue: any) => string) \| undefined) => boolean) \| null` | -       | Filter function used to match items vs input query.&#xA;The `itemToStringLabel` function is provided to help convert items to strings for comparison.                                                                                                                         |
| inputValue                                                             | `string \| number \| string[]`                                                                                       | -       | The input value of the combobox.                                                                                                                                                                                                                                              |
| itemToStringLabel                                                      | `((itemValue: ItemValue) => string)`                                                                                 | -       | When items' values are objects, converts its value to a string label for input display.                                                                                                                                                                                       |
| itemToStringValue                                                      | `((itemValue: ItemValue) => string)`                                                                                 | -       | When items' values are objects, converts its value to a string value for form submission.                                                                                                                                                                                     |
| items                                                                  | `ItemValue[] \| Group<ItemValue>[]`                                                                                  | -       | The items to be displayed in the list.                                                                                                                                                                                                                                        |
| limit                                                                  | `number`                                                                                                             | `-1`    | The maximum number of items to display in the list.                                                                                                                                                                                                                           |
| locale                                                                 | `Intl.LocalesArgument`                                                                                               | -       | The locale to use for string comparison.&#xA;Defaults to the user's runtime locale.                                                                                                                                                                                           |
| modal                                                                  | `boolean`                                                                                                            | `false` | Determines if the popup enters a modal state when open.\* `true`: user interaction is limited to the popup: document page scroll is locked and pointer interactions on outside elements are disabled.                                                                         |
| \* `false`: user interaction with the rest of the document is allowed. |
| multiple                                                               | `boolean \| undefined`                                                                                               | `false` | Whether multiple items can be selected.                                                                                                                                                                                                                                       |
| onInputValueChange                                                     | `((value: string, eventDetails: Combobox.Root.ChangeEventDetails) => void)`                                          | -       | Callback fired when the input value of the combobox changes.                                                                                                                                                                                                                  |
| onItemHighlighted                                                      | `((itemValue: any, data: { type: 'none' \| 'keyboard' \| 'pointer', index: number }) => void)`                       | -       | Callback fired when the user navigates the list and highlights an item.&#xA;Passes the item and the type of navigation or `undefined` when no item is highlighted.\* `keyboard`: The item was highlighted via keyboard navigation.                                            |

- `pointer`: The item was highlighted via pointer navigation.
- `none`: The item was highlighted via programmatic navigation. |
  | onOpenChangeComplete | `((open: boolean) => void)` | - | Event handler called after any animations complete when the popup is opened or closed. |
  | openOnInputClick | `boolean` | `true` | Whether the popup opens when clicking the input. |
  | virtualized | `boolean` | `false` | Whether the items are being externally virtualized. |
  | disabled | `boolean` | `false` | Whether the component should ignore user interaction. |
  | readOnly | `boolean` | `false` | Whether the user should be unable to choose a different option from the popup. |
  | required | `boolean` | `false` | Whether the user must choose a value before submitting a form. |
  | inputRef | `RefObject<HTMLInputElement>` | - | A ref to the hidden input element. |
  | id | `string` | - | The id of the component. |
  | children | `ReactNode` | - | - |

### Value

The current value of the combobox.
Doesn't render its own HTML element.

**Value Props:**

| Prop     | Type                                               | Default | Description |
| :------- | :------------------------------------------------- | :------ | :---------- |
| children | `ReactNode \| ((selectedValue: any) => ReactNode)` | -       | -           |

### Icon

An icon that indicates that the trigger button opens the popup.
Renders a `<span>` element.

**Icon Props:**

| Prop      | Type                                                                               | Default | Description                                                                                                                                                                                  |
| :-------- | :--------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Icon.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Icon.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Input

A text input to search for items in the list.
Renders an `<input>` element.

**Input Props:**

| Prop      | Type                                                                                | Default | Description                                                                                                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| disabled  | `boolean`                                                                           | `false` | Whether the component should ignore user interaction.                                                                                                                                        |
| className | `string \| ((state: Combobox.Input.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Input.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Input Data Attributes:**

| Attribute       | Type | Description                                                                  |
| :-------------- | :--- | :--------------------------------------------------------------------------- |
| data-popup-open | -    | Present when the corresponding popup is open.                                |
| data-pressed    | -    | Present when the input is pressed.                                           |
| data-disabled   | -    | Present when the component is disabled.                                      |
| data-readonly   | -    | Present when the component is readonly.                                      |
| data-required   | -    | Present when the component is required.                                      |
| data-valid      | -    | Present when the component is in valid state (when wrapped in Field.Root).   |
| data-invalid    | -    | Present when the component is in invalid state (when wrapped in Field.Root). |
| data-dirty      | -    | Present when the component's value has changed (when wrapped in Field.Root). |
| data-touched    | -    | Present when the component has been touched (when wrapped in Field.Root).    |
| data-filled     | -    | Present when the component has a value (when wrapped in Field.Root).         |
| data-focused    | -    | Present when the input is focused (when wrapped in Field.Root).              |

### Clear

Clears the value when clicked.
Renders a `<button>` element.

**Clear Props:**

| Prop         | Type                                                                                | Default | Description                                                                                                                                                                                  |
| :----------- | :---------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nativeButton | `boolean`                                                                           | `true`  | Whether the component renders a native `<button>` element when replacing it&#xA;via the `render` prop.&#xA;Set to `false` if the rendered element is not a button (e.g. `<div>`).            |
| disabled     | `boolean`                                                                           | `false` | Whether the component should ignore user interaction.                                                                                                                                        |
| className    | `string \| ((state: Combobox.Clear.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| keepMounted  | `boolean`                                                                           | `false` | Whether the component should remain mounted in the DOM when not visible.                                                                                                                     |
| render       | `ReactElement \| ((props: HTMLProps, state: Combobox.Clear.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Trigger

A button that opens the popup.
Renders a `<button>` element.

**Trigger Props:**

| Prop         | Type                                                                                  | Default | Description                                                                                                                                                                                  |
| :----------- | :------------------------------------------------------------------------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nativeButton | `boolean`                                                                             | `true`  | Whether the component renders a native `<button>` element when replacing it&#xA;via the `render` prop.&#xA;Set to `false` if the rendered element is not a button (e.g. `<div>`).            |
| disabled     | `boolean`                                                                             | `false` | Whether the component should ignore user interaction.                                                                                                                                        |
| className    | `string \| ((state: Combobox.Trigger.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render       | `ReactElement \| ((props: HTMLProps, state: Combobox.Trigger.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Trigger Data Attributes:**

| Attribute       | Type | Description                                                                  |
| :-------------- | :--- | :--------------------------------------------------------------------------- |
| data-popup-open | -    | Present when the corresponding popup is open.                                |
| data-pressed    | -    | Present when the trigger is pressed.                                         |
| data-disabled   | -    | Present when the component is disabled.                                      |
| data-readonly   | -    | Present when the component is readonly.                                      |
| data-required   | -    | Present when the component is required.                                      |
| data-valid      | -    | Present when the component is in valid state (when wrapped in Field.Root).   |
| data-invalid    | -    | Present when the component is in invalid state (when wrapped in Field.Root). |
| data-dirty      | -    | Present when the component's value has changed (when wrapped in Field.Root). |
| data-touched    | -    | Present when the component has been touched (when wrapped in Field.Root).    |
| data-filled     | -    | Present when the component has a value (when wrapped in Field.Root).         |
| data-focused    | -    | Present when the trigger is focused (when wrapped in Field.Root).            |

### Chips

A container for the chips in a multiselectable input.
Renders a `<div>` element.

**Chips Props:**

| Prop      | Type                                                                                | Default | Description                                                                                                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Chips.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Chips.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Chip

An individual chip that represents a value in a multiselectable input.
Renders a `<div>` element.

**Chip Props:**

| Prop      | Type                                                                               | Default | Description                                                                                                                                                                                  |
| :-------- | :--------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Chip.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Chip.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### ChipRemove

A button to remove a chip.
Renders a `<button>` element.

**ChipRemove Props:**

| Prop         | Type                                                                                     | Default | Description                                                                                                                                                                                  |
| :----------- | :--------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nativeButton | `boolean`                                                                                | `true`  | Whether the component renders a native `<button>` element when replacing it&#xA;via the `render` prop.&#xA;Set to `false` if the rendered element is not a button (e.g. `<div>`).            |
| className    | `string \| ((state: Combobox.ChipRemove.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render       | `ReactElement \| ((props: HTMLProps, state: Combobox.ChipRemove.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### List

A list container for the items.
Renders a `<div>` element.

**List Props:**

| Prop      | Type                                                                               | Default | Description                                                                                                                                                                                  |
| :-------- | :--------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children  | `ReactNode \| ((item: any, index: number) => ReactNode)`                           | -       | -                                                                                                                                                                                            |
| className | `string \| ((state: Combobox.List.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.List.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Portal

A portal element that moves the popup to a different part of the DOM.
By default, the portal element is appended to `<body>`.

**Portal Props:**

| Prop        | Type                                                    | Default | Description                                                              |
| :---------- | :------------------------------------------------------ | :------ | :----------------------------------------------------------------------- |
| container   | `HTMLElement \| RefObject<HTMLElement \| null> \| null` | -       | A parent element to render the portal element into.                      |
| children    | `ReactNode`                                             | -       | -                                                                        |
| keepMounted | `boolean`                                               | `false` | Whether to keep the portal mounted in the DOM while the popup is hidden. |

### Backdrop

An overlay displayed beneath the popup.
Renders a `<div>` element.

**Backdrop Props:**

| Prop      | Type                                                                                   | Default | Description                                                                                                                                                                                  |
| :-------- | :------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Backdrop.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Backdrop.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Backdrop Data Attributes:**

| Attribute           | Type | Description                              |
| :------------------ | :--- | :--------------------------------------- |
| data-open           | -    | Present when the popup is open.          |
| data-closed         | -    | Present when the popup is closed.        |
| data-starting-style | -    | Present when the popup is animating in.  |
| data-ending-style   | -    | Present when the popup is animating out. |

### Positioner

Positions the popup against the trigger.
Renders a `<div>` element.

**Positioner Props:**

| Prop               | Type                       | Default    | Description                                                                                                                                                                                                                                                                                                                                                                           |
| :----------------- | :------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| collisionAvoidance | `CollisionAvoidance`       | -          | Determines how to handle collisions when positioning the popup.                                                                                                                                                                                                                                                                                                                       |
| align              | `Align`                    | `'center'` | How to align the popup relative to the specified side.                                                                                                                                                                                                                                                                                                                                |
| alignOffset        | `number \| OffsetFunction` | `0`        | Additional offset along the alignment axis in pixels.&#xA;Also accepts a function that returns the offset to read the dimensions of the anchor&#xA;and positioner elements, along with its side and alignment.The function takes a `data` object parameter with the following properties:\* `data.anchor`: the dimensions of the anchor element with properties `width` and `height`. |

- `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
- `data.side`: which side of the anchor element the positioner is aligned against.
- `data.align`: how the positioner is aligned relative to the specified side. |
  | side | `Side` | `'bottom'` | Which side of the anchor element to align the popup against.&#xA;May automatically change to avoid collisions. |
  | sideOffset | `number \| OffsetFunction` | `0` | Distance between the anchor and the popup in pixels.&#xA;Also accepts a function that returns the distance to read the dimensions of the anchor&#xA;and positioner elements, along with its side and alignment.The function takes a `data` object parameter with the following properties:\* `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
- `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
- `data.side`: which side of the anchor element the positioner is aligned against.
- `data.align`: how the positioner is aligned relative to the specified side. |
  | arrowPadding | `number` | `5` | Minimum distance to maintain between the arrow and the edges of the popup.Use it to prevent the arrow element from hanging out of the rounded corners of a popup. |
  | anchor | `Element \| RefObject<Element \| null> \| VirtualElement \| (() => Element \| VirtualElement \| null) \| null` | - | An element to position the popup against.&#xA;By default, the popup will be positioned against the trigger. |
  | collisionBoundary | `Boundary` | `'clipping-ancestors'` | An element or a rectangle that delimits the area that the popup is confined to. |
  | collisionPadding | `Padding` | `5` | Additional space to maintain from the edge of the collision boundary. |
  | sticky | `boolean` | `false` | Whether to maintain the popup in the viewport after&#xA;the anchor element was scrolled out of view. |
  | positionMethod | `'fixed' \| 'absolute'` | `'absolute'` | Determines which CSS `position` property to use. |
  | trackAnchor | `boolean` | `true` | Whether the popup tracks any layout shift of its positioning anchor. |
  | className | `string \| ((state: Combobox.Positioner.State) => string)` | - | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state. |
  | render | `ReactElement \| ((props: HTMLProps, state: Combobox.Positioner.State) => ReactElement)` | - | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Positioner Data Attributes:**

| Attribute          | Type                                                                       | Description                                                           |
| :----------------- | :------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| data-open          | -                                                                          | Present when the popup is open.                                       |
| data-closed        | -                                                                          | Present when the popup is closed.                                     |
| data-anchor-hidden | -                                                                          | Present when the anchor is hidden.                                    |
| data-align         | `'start' \| 'center' \| 'end'`                                             | Indicates how the popup is aligned relative to specified side.        |
| data-empty         | -                                                                          | Present when the items list is empty.                                 |
| data-side          | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-end' \| 'inline-start'` | Indicates which side the popup is positioned relative to the trigger. |

**Positioner CSS Variables:**

| Variable           | Type     | Default | Description                                                                            |
| :----------------- | :------- | :------ | :------------------------------------------------------------------------------------- |
| --anchor-height    | `number` | -       | The anchor's height.                                                                   |
| --anchor-width     | `number` | -       | The anchor's width.                                                                    |
| --available-height | `number` | -       | The available height between the trigger and the edge of the viewport.                 |
| --available-width  | `number` | -       | The available width between the trigger and the edge of the viewport.                  |
| --transform-origin | `string` | -       | The coordinates that this element is anchored to. Used for animations and transitions. |

### Popup

A container for the list.
Renders a `<div>` element.

**Popup Props:**

| Prop         | Type                                                                                                                   | Default | Description                                                                             |
| :----------- | :--------------------------------------------------------------------------------------------------------------------- | :------ | :-------------------------------------------------------------------------------------- |
| initialFocus | `boolean \| RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| void \| HTMLElement \| null)` | -       | Determines the element to focus when the popup is opened.\* `false`: Do not move focus. |

- `true`: Move focus based on the default behavior (first tabbable element or popup).
- `RefObject`: Move focus to the ref element.
- `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).&#xA;Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing. |
  | finalFocus | `boolean \| RefObject<HTMLElement \| null> \| ((closeType: InteractionType) => boolean \| void \| HTMLElement \| null)` | - | Determines the element to focus when the popup is closed.\* `false`: Do not move focus.
- `true`: Move focus based on the default behavior (trigger or previously focused element).
- `RefObject`: Move focus to the ref element.
- `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).&#xA;Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing. |
  | className | `string \| ((state: Combobox.Popup.State) => string)` | - | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state. |
  | render | `ReactElement \| ((props: HTMLProps, state: Combobox.Popup.State) => ReactElement)` | - | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Popup Data Attributes:**

| Attribute           | Type                                                                       | Description                                                           |
| :------------------ | :------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| data-open           | -                                                                          | Present when the popup is open.                                       |
| data-closed         | -                                                                          | Present when the popup is closed.                                     |
| data-align          | `'start' \| 'center' \| 'end'`                                             | Indicates how the popup is aligned relative to specified side.        |
| data-empty          | -                                                                          | Present when the items list is empty.                                 |
| data-instant        | `'click' \| 'dismiss'`                                                     | Present if animations should be instant.                              |
| data-side           | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-end' \| 'inline-start'` | Indicates which side the popup is positioned relative to the trigger. |
| data-starting-style | -                                                                          | Present when the popup is animating in.                               |
| data-ending-style   | -                                                                          | Present when the popup is animating out.                              |

### Arrow

Displays an element positioned against the anchor.
Renders a `<div>` element.

**Arrow Props:**

| Prop      | Type                                                                                | Default | Description                                                                                                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Arrow.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Arrow.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Arrow Data Attributes:**

| Attribute          | Type                                                                       | Description                                                           |
| :----------------- | :------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| data-open          | -                                                                          | Present when the popup is open.                                       |
| data-closed        | -                                                                          | Present when the popup is closed.                                     |
| data-uncentered    | -                                                                          | Present when the arrow is uncentered.                                 |
| data-anchor-hidden | -                                                                          | Present when the anchor is hidden.                                    |
| data-align         | `'start' \| 'center' \| 'end'`                                             | Indicates how the popup is aligned relative to specified side.        |
| data-side          | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-end' \| 'inline-start'` | Indicates which side the popup is positioned relative to the trigger. |

### Status

Displays a status message whose content changes are announced politely to screen readers.
Useful for conveying the status of an asynchronously loaded list.
Renders a `<div>` element.

**Status Props:**

| Prop      | Type                                                                                 | Default | Description                                                                                                                                                                                  |
| :-------- | :----------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Status.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Status.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Empty

Renders its children only when the list is empty.
Requires the `items` prop on the root component.
Announces changes politely to screen readers.
Renders a `<div>` element.

**Empty Props:**

| Prop      | Type                                                                                | Default | Description                                                                                                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Empty.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Empty.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Collection

Renders filtered list items.
Doesn't render its own HTML element.If rendering a flat list, pass a function child to the `List` component instead, which implicitly wraps it.

**Collection Props:**

| Prop     | Type                                        | Default | Description |
| :------- | :------------------------------------------ | :------ | :---------- |
| children | `((item: any, index: number) => ReactNode)` | -       | -           |

### Row

Displays a single row of items in a grid list.
Specify `cols` on the root component to indicate the number of columns.
Renders a `<div>` element.

**Row Props:**

| Prop      | Type                                                                              | Default | Description                                                                                                                                                                                  |
| :-------- | :-------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.Row.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Row.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Item

An individual item in the list.
Renders a `<div>` element.

**Item Props:**

| Prop         | Type                                                                               | Default | Description                                                                                                                                                                                  |
| :----------- | :--------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value        | `any`                                                                              | -       | A unique value that identifies this item.                                                                                                                                                    |
| index        | `number`                                                                           | -       | The index of the item in the list. Improves performance when specified by avoiding the need to calculate the index automatically from the DOM.                                               |
| nativeButton | `boolean`                                                                          | `false` | Whether the component renders a native `<button>` element when replacing it&#xA;via the `render` prop.&#xA;Set to `true` if the rendered element is a native button.                         |
| disabled     | `boolean`                                                                          | `false` | Whether the component should ignore user interaction.                                                                                                                                        |
| children     | `ReactNode`                                                                        | -       | -                                                                                                                                                                                            |
| className    | `string \| ((state: Combobox.Item.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render       | `ReactElement \| ((props: HTMLProps, state: Combobox.Item.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

**Item Data Attributes:**

| Attribute        | Type | Description                           |
| :--------------- | :--- | :------------------------------------ |
| data-selected    | -    | Present when the item is selected.    |
| data-highlighted | -    | Present when the item is highlighted. |
| data-disabled    | -    | Present when the item is disabled.    |

### ItemIndicator

Indicates whether the item is selected.
Renders a `<span>` element.

**ItemIndicator Props:**

| Prop        | Type                                                                                        | Default | Description                                                                                                                                                                                  |
| :---------- | :------------------------------------------------------------------------------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `ReactNode`                                                                                 | -       | -                                                                                                                                                                                            |
| className   | `string \| ((state: Combobox.ItemIndicator.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| keepMounted | `boolean`                                                                                   | `false` | Whether to keep the HTML element in the DOM when the item is not selected.                                                                                                                   |
| render      | `ReactElement \| ((props: HTMLProps, state: Combobox.ItemIndicator.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Group

Groups related items with the corresponding label.
Renders a `<div>` element.

**Group Props:**

| Prop      | Type                                                                                | Default | Description                                                                                                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| items     | `any[]`                                                                             | -       | Items to be rendered within this group.&#xA;When provided, child `Collection` components will use these items.                                                                               |
| className | `string \| ((state: Combobox.Group.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.Group.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### GroupLabel

An accessible label that is automatically associated with its parent group.
Renders a `<div>` element.

**GroupLabel Props:**

| Prop      | Type                                                                                     | Default | Description                                                                                                                                                                                  |
| :-------- | :--------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className | `string \| ((state: Combobox.GroupLabel.State) => string)`                               | -       | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render    | `ReactElement \| ((props: HTMLProps, state: Combobox.GroupLabel.State) => ReactElement)` | -       | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

### Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

**Separator Props:**

| Prop        | Type                                                                           | Default        | Description                                                                                                                                                                                  |
| :---------- | :----------------------------------------------------------------------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orientation | `Orientation`                                                                  | `'horizontal'` | The orientation of the separator.                                                                                                                                                            |
| className   | `string \| ((state: Separator.State) => string)`                               | -              | CSS class applied to the element, or a function that&#xA;returns a class based on the component’s state.                                                                                     |
| render      | `ReactElement \| ((props: HTMLProps, state: Separator.State) => ReactElement)` | -              | Allows you to replace the component’s HTML element&#xA;with a different tag, or compose it with another component.Accepts a `ReactElement` or a function that returns the element to render. |

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching. This hook is used when externally filtering items. Pass the result to the `filter` prop of `Combobox.Root`.

### Input parameters

Accepts all `Intl.CollatorOptions`, plus the following options:

**Props:**

| Prop     | Type                   | Default | Description                                                                                                                                               |
| :------- | :--------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| locale   | `Intl.LocalesArgument` | -       | The locale to use for string comparison.                                                                                                                  |
| multiple | `boolean`              | `false` | Whether the combobox is in multiple selection mode.                                                                                                       |
| value    | `any`                  | -       | The current value of the combobox. For single selection, pass this so the selected item remains visible when the query is empty or matches the selection. |

### Return value

**Return Value:**

| Property   | Type                                         | Description                                          |
| :--------- | :------------------------------------------- | :--------------------------------------------------- |
| contains   | `(itemValue: any, query: string) => boolean` | Returns whether the item matches the query anywhere. |
| startsWith | `(itemValue: any, query: string) => boolean` | Returns whether the item starts with the query.      |
| endsWith   | `(itemValue: any, query: string) => boolean` | Returns whether the item ends with the query.        |

## Examples

### Multiple select

The combobox can allow multiple selections by adding the `multiple` prop to `Combobox.Root`. Selection chips are rendered with `Combobox.Chip` inside the input that can be removed.

## Demo

### Tailwind

This example shows how to implement the component using Tailwind CSS.

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';

export default function ExampleMultipleCombobox() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  return (
    <Combobox.Root items={langs} multiple>
      <div className="max-w-[28rem] flex flex-col gap-1">
        <label className="text-sm leading-5 font-medium text-gray-900" htmlFor={id}>
          Programming languages
        </label>
        <Combobox.Chips
          className="flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 px-1.5 py-1 w-64 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800 min-[500px]:w-[22rem]"
          ref={containerRef}
        >
          <Combobox.Value>
            {(value: ProgrammingLanguage[]) => (
              <React.Fragment>
                {value.map((language) => (
                  <Combobox.Chip
                    key={language.id}
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-[0.2rem] text-sm text-gray-900 outline-none cursor-default [@media(hover:hover)]:[&[data-highlighted]]:bg-blue-800 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 focus-within:bg-blue-800 focus-within:text-gray-50"
                    aria-label={language.value}
                  >
                    {language.value}
                    <Combobox.ChipRemove
                      className="rounded-md p-1 text-inherit hover:bg-gray-200"
                      aria-label="Remove"
                    >
                      <XIcon />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  placeholder={value.length > 0 ? '' : 'e.g. TypeScript'}
                  className="min-w-12 flex-1 h-8 rounded-md border-0 bg-transparent pl-2 text-base text-gray-900 outline-none"
                />
              </React.Fragment>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),24rem)] max-w-[var(--available-width)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-lg bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No languages found.
            </Combobox.Empty>
            <Combobox.List>
              {(language: ProgrammingLanguage) => (
                <Combobox.Item
                  key={language.id}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                  value={language}
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{language.value}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function XIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface ProgrammingLanguage {
  id: string;
  value: string;
}

const langs: ProgrammingLanguage[] = [
  { id: 'js', value: 'JavaScript' },
  { id: 'ts', value: 'TypeScript' },
  { id: 'py', value: 'Python' },
  { id: 'java', value: 'Java' },
  { id: 'cpp', value: 'C++' },
  { id: 'cs', value: 'C#' },
  { id: 'php', value: 'PHP' },
  { id: 'ruby', value: 'Ruby' },
  { id: 'go', value: 'Go' },
  { id: 'rust', value: 'Rust' },
  { id: 'swift', value: 'Swift' },
];
```

### CSS Modules

This example shows how to implement the component using CSS Modules.

```css
/* index.module.css */
.Container {
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.Label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--color-gray-900);
}

.Chips {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.125rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  padding: 0.25rem 0.375rem;
  width: 16rem;

  &:focus-within {
    outline: 2px solid var(--color-blue);
    outline-offset: 2px;
    outline-offset: -1px;
  }

  @media (min-width: 500px) {
    width: 22rem;
  }
}

.Chip {
  display: flex;
  align-items: center;
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  padding: 0.2rem 0.2rem 0.2rem 0.4rem;
  overflow: hidden;
  gap: 0.25rem;
  outline: 0;
  cursor: default;

  &:focus-within {
    background-color: var(--color-blue);
    color: var(--color-gray-50);
  }

  @media (hover: hover) {
    &[data-highlighted] {
      background-color: var(--color-blue);
      color: var(--color-gray-50);
    }
  }
}

.ChipButton {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.125rem 0.25rem 0.125rem 0.5rem;
  font-size: inherit;
  color: inherit;
  cursor: default;
  flex: 1;
  outline: 0;
}

.ChipRemove {
  border: none;
  background: none;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  border-radius: 0.375rem;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-200);
    }
  }
}

.Input {
  flex: 1;
  box-sizing: border-box;
  padding-left: 0.5rem;
  margin: 0;
  border: none;
  height: 2rem;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: transparent;
  color: var(--color-gray-900);
  min-width: 3rem;

  &:focus {
    outline: none;
  }
}

.Trigger {
  box-sizing: border-box;
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: none;
  color: var(--color-gray-500);
  border-radius: 0.25rem;

  &:hover {
    color: var(--color-gray-700);
    background-color: var(--color-gray-100);
  }

  &:focus {
    outline: 2px solid var(--color-blue-500);
    outline-offset: 2px;
  }
}

.TriggerIcon {
  width: 1rem;
  height: 1rem;
}

.Positioner {
  outline: 0;
  z-index: 50;
}

.Popup {
  box-sizing: border-box;
  border-radius: 0.5rem;
  padding-block: 0.5rem;
  background-color: canvas;
  color: var(--color-gray-900);
  width: var(--anchor-width);
  max-width: var(--available-width);
  max-height: min(var(--available-height), 24rem);
  overflow-y: auto;
  scroll-padding-block: 0.5rem;
  overscroll-behavior: contain;

  @media (prefers-color-scheme: light) {
    outline: 1px solid var(--color-gray-200);
    box-shadow:
      0 10px 15px -3px var(--color-gray-200),
      0 4px 6px -4px var(--color-gray-200);
  }

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
    outline-offset: -1px;
  }
}

.Item {
  box-sizing: border-box;
  outline: 0;
  cursor: default;
  user-select: none;
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  display: grid;
  gap: 0.5rem;
  align-items: center;
  grid-template-columns: 0.75rem 1fr;
  font-size: 1rem;
  line-height: 1rem;

  &[data-selected] {
    z-index: 0;
    position: relative;
    color: var(--color-gray-900);
  }

  &[data-selected]::before,
  &[data-highlighted]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.5rem;
    border-radius: 0.25rem;
  }

  @media (hover: hover) {
    &[data-highlighted] {
      z-index: 0;
      position: relative;
      color: var(--color-gray-50);
    }

    &[data-highlighted]::before {
      background-color: var(--color-gray-900);
    }
  }
}

.ItemText {
  grid-column-start: 2;
}

.ItemIndicator {
  grid-column-start: 1;
}

.ItemIndicatorIcon {
  display: block;
  width: 0.75rem;
  height: 0.75rem;
}

.ItemName {
  font-weight: 500;
  color: inherit;
}

.Empty:not(:empty) {
  box-sizing: border-box;
  font-size: 0.925rem;
  line-height: 1rem;
  color: var(--color-gray-600);
  padding: 0.5rem 1rem;
}
```

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import styles from './index.module.css';

export default function ExampleMultipleCombobox() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  return (
    <Combobox.Root items={langs} multiple>
      <div className={styles.Container}>
        <label className={styles.Label} htmlFor={id}>
          Programming languages
        </label>
        <Combobox.Chips className={styles.Chips} ref={containerRef}>
          <Combobox.Value>
            {(value: ProgrammingLanguage[]) => (
              <React.Fragment>
                {value.map((language) => (
                  <Combobox.Chip
                    key={language.id}
                    className={styles.Chip}
                    aria-label={language.value}
                  >
                    {language.value}
                    <Combobox.ChipRemove className={styles.ChipRemove} aria-label="Remove">
                      <XIcon />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  placeholder={value.length > 0 ? '' : 'e.g. TypeScript'}
                  className={styles.Input}
                />
              </React.Fragment>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className={styles.Positioner} sideOffset={4} anchor={containerRef}>
          <Combobox.Popup className={styles.Popup}>
            <Combobox.Empty className={styles.Empty}>No languages found.</Combobox.Empty>
            <Combobox.List>
              {(language: ProgrammingLanguage) => (
                <Combobox.Item key={language.id} className={styles.Item} value={language}>
                  <Combobox.ItemIndicator className={styles.ItemIndicator}>
                    <CheckIcon className={styles.ItemIndicatorIcon} />
                  </Combobox.ItemIndicator>
                  <div className={styles.ItemText}>{language.value}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function XIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface ProgrammingLanguage {
  id: string;
  value: string;
}

const langs: ProgrammingLanguage[] = [
  { id: 'js', value: 'JavaScript' },
  { id: 'ts', value: 'TypeScript' },
  { id: 'py', value: 'Python' },
  { id: 'java', value: 'Java' },
  { id: 'cpp', value: 'C++' },
  { id: 'cs', value: 'C#' },
  { id: 'php', value: 'PHP' },
  { id: 'ruby', value: 'Ruby' },
  { id: 'go', value: 'Go' },
  { id: 'rust', value: 'Rust' },
  { id: 'swift', value: 'Swift' },
];
```

### Input inside popup

`Combobox.Input` can be rendered inside `Combobox.Popup` to create a searchable select menu.

## Demo

### Tailwind

This example shows how to implement the component using Tailwind CSS.

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';

export default function ExamplePopoverCombobox() {
  return (
    <Combobox.Root items={countries} defaultValue={countries[0]}>
      <Combobox.Trigger className="flex bg-[canvas] h-10 min-w-[12rem] items-center justify-between gap-3 rounded-md border border-gray-200 pr-3 pl-3.5 text-base text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 cursor-default">
        <Combobox.Value />
        <Combobox.Icon className="flex">
          <ChevronUpDownIcon />
        </Combobox.Icon>
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner align="start" sideOffset={4}>
          <Combobox.Popup
            className="[--input-container-height:3rem] origin-[var(--transform-origin)] max-w-[var(--available-width)] max-h-[min(24rem,var(--available-height))] rounded-lg bg-[canvas] shadow-lg shadow-gray-200 text-gray-900 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300"
            aria-label="Select country"
          >
            <div className="w-80 h-[var(--input-container-height)] text-center p-2">
              <Combobox.Input
                placeholder="e.g. United Kingdom"
                className="h-10 w-full font-normal rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
              />
            </div>
            <Combobox.Empty className="p-4 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No countries found.
            </Combobox.Empty>
            <Combobox.List className="overflow-y-auto scroll-py-2 py-2 overscroll-contain max-h-[min(calc(24rem-var(--input-container-height)),calc(var(--available-height)-var(--input-container-height)))] empty:p-0">
              {(country: Country) => (
                <Combobox.Item
                  key={country.code}
                  value={country}
                  className="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{country.label ?? country.value}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function ChevronUpDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.5"
      {...props}
    >
      <path d="M0.5 4.5L4 1.5L7.5 4.5" />
      <path d="M0.5 7.5L4 10.5L7.5 7.5" />
    </svg>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

interface Country {
  code: string;
  value: string | null;
  continent: string;
  label: string;
}

const countries: Country[] = [
  { code: '', value: null, continent: '', label: 'Select country' },
  { code: 'af', value: 'afghanistan', label: 'Afghanistan', continent: 'Asia' },
  { code: 'al', value: 'albania', label: 'Albania', continent: 'Europe' },
  { code: 'dz', value: 'algeria', label: 'Algeria', continent: 'Africa' },
  { code: 'ad', value: 'andorra', label: 'Andorra', continent: 'Europe' },
  { code: 'ao', value: 'angola', label: 'Angola', continent: 'Africa' },
  { code: 'ar', value: 'argentina', label: 'Argentina', continent: 'South America' },
  { code: 'am', value: 'armenia', label: 'Armenia', continent: 'Asia' },
  { code: 'au', value: 'australia', label: 'Australia', continent: 'Oceania' },
  { code: 'at', value: 'austria', label: 'Austria', continent: 'Europe' },
  { code: 'az', value: 'azerbaijan', label: 'Azerbaijan', continent: 'Asia' },
  { code: 'bs', value: 'bahamas', label: 'Bahamas', continent: 'North America' },
  { code: 'bh', value: 'bahrain', label: 'Bahrain', continent: 'Asia' },
  { code: 'bd', value: 'bangladesh', label: 'Bangladesh', continent: 'Asia' },
  { code: 'bb', value: 'barbados', label: 'Barbados', continent: 'North America' },
  { code: 'by', value: 'belarus', label: 'Belarus', continent: 'Europe' },
  { code: 'be', value: 'belgium', label: 'Belgium', continent: 'Europe' },
  { code: 'bz', value: 'belize', label: 'Belize', continent: 'North America' },
  { code: 'bj', value: 'benin', label: 'Benin', continent: 'Africa' },
  { code: 'bt', value: 'bhutan', label: 'Bhutan', continent: 'Asia' },
  { code: 'bo', value: 'bolivia', label: 'Bolivia', continent: 'South America' },
  {
    code: 'ba',
    value: 'bosnia-and-herzegovina',
    label: 'Bosnia and Herzegovina',
    continent: 'Europe',
  },
  { code: 'bw', value: 'botswana', label: 'Botswana', continent: 'Africa' },
  { code: 'br', value: 'brazil', label: 'Brazil', continent: 'South America' },
  { code: 'bn', value: 'brunei', label: 'Brunei', continent: 'Asia' },
  { code: 'bg', value: 'bulgaria', label: 'Bulgaria', continent: 'Europe' },
  { code: 'bf', value: 'burkina-faso', label: 'Burkina Faso', continent: 'Africa' },
  { code: 'bi', value: 'burundi', label: 'Burundi', continent: 'Africa' },
  { code: 'kh', value: 'cambodia', label: 'Cambodia', continent: 'Asia' },
  { code: 'cm', value: 'cameroon', label: 'Cameroon', continent: 'Africa' },
  { code: 'ca', value: 'canada', label: 'Canada', continent: 'North America' },
  { code: 'cv', value: 'cape-verde', label: 'Cape Verde', continent: 'Africa' },
  {
    code: 'cf',
    value: 'central-african-republic',
    label: 'Central African Republic',
    continent: 'Africa',
  },
  { code: 'td', value: 'chad', label: 'Chad', continent: 'Africa' },
  { code: 'cl', value: 'chile', label: 'Chile', continent: 'South America' },
  { code: 'cn', value: 'china', label: 'China', continent: 'Asia' },
  { code: 'co', value: 'colombia', label: 'Colombia', continent: 'South America' },
  { code: 'km', value: 'comoros', label: 'Comoros', continent: 'Africa' },
  { code: 'cg', value: 'congo', label: 'Congo', continent: 'Africa' },
  { code: 'cr', value: 'costa-rica', label: 'Costa Rica', continent: 'North America' },
  { code: 'hr', value: 'croatia', label: 'Croatia', continent: 'Europe' },
  { code: 'cu', value: 'cuba', label: 'Cuba', continent: 'North America' },
  { code: 'cy', value: 'cyprus', label: 'Cyprus', continent: 'Asia' },
  { code: 'cz', value: 'czech-republic', label: 'Czech Republic', continent: 'Europe' },
  { code: 'dk', value: 'denmark', label: 'Denmark', continent: 'Europe' },
  { code: 'dj', value: 'djibouti', label: 'Djibouti', continent: 'Africa' },
  { code: 'dm', value: 'dominica', label: 'Dominica', continent: 'North America' },
  {
    code: 'do',
    value: 'dominican-republic',
    label: 'Dominican Republic',
    continent: 'North America',
  },
  { code: 'ec', value: 'ecuador', label: 'Ecuador', continent: 'South America' },
  { code: 'eg', value: 'egypt', label: 'Egypt', continent: 'Africa' },
  { code: 'sv', value: 'el-salvador', label: 'El Salvador', continent: 'North America' },
  { code: 'gq', value: 'equatorial-guinea', label: 'Equatorial Guinea', continent: 'Africa' },
  { code: 'er', value: 'eritrea', label: 'Eritrea', continent: 'Africa' },
  { code: 'ee', value: 'estonia', label: 'Estonia', continent: 'Europe' },
  { code: 'et', value: 'ethiopia', label: 'Ethiopia', continent: 'Africa' },
  { code: 'fj', value: 'fiji', label: 'Fiji', continent: 'Oceania' },
  { code: 'fi', value: 'finland', label: 'Finland', continent: 'Europe' },
  { code: 'fr', value: 'france', label: 'France', continent: 'Europe' },
  { code: 'ga', value: 'gabon', label: 'Gabon', continent: 'Africa' },
  { code: 'gm', value: 'gambia', label: 'Gambia', continent: 'Africa' },
  { code: 'ge', value: 'georgia', label: 'Georgia', continent: 'Asia' },
  { code: 'de', value: 'germany', label: 'Germany', continent: 'Europe' },
  { code: 'gh', value: 'ghana', label: 'Ghana', continent: 'Africa' },
  { code: 'gr', value: 'greece', label: 'Greece', continent: 'Europe' },
  { code: 'gd', value: 'grenada', label: 'Grenada', continent: 'North America' },
  { code: 'gt', value: 'guatemala', label: 'Guatemala', continent: 'North America' },
  { code: 'gn', value: 'guinea', label: 'Guinea', continent: 'Africa' },
  { code: 'gw', value: 'guinea-bissau', label: 'Guinea-Bissau', continent: 'Africa' },
  { code: 'gy', value: 'guyana', label: 'Guyana', continent: 'South America' },
  { code: 'ht', value: 'haiti', label: 'Haiti', continent: 'North America' },
  { code: 'hn', value: 'honduras', label: 'Honduras', continent: 'North America' },
  { code: 'hu', value: 'hungary', label: 'Hungary', continent: 'Europe' },
  { code: 'is', value: 'iceland', label: 'Iceland', continent: 'Europe' },
  { code: 'in', value: 'india', label: 'India', continent: 'Asia' },
  { code: 'id', value: 'indonesia', label: 'Indonesia', continent: 'Asia' },
  { code: 'ir', value: 'iran', label: 'Iran', continent: 'Asia' },
  { code: 'iq', value: 'iraq', label: 'Iraq', continent: 'Asia' },
  { code: 'ie', value: 'ireland', label: 'Ireland', continent: 'Europe' },
  { code: 'il', value: 'israel', label: 'Israel', continent: 'Asia' },
  { code: 'it', value: 'italy', label: 'Italy', continent: 'Europe' },
  { code: 'jm', value: 'jamaica', label: 'Jamaica', continent: 'North America' },
  { code: 'jp', value: 'japan', label: 'Japan', continent: 'Asia' },
  { code: 'jo', value: 'jordan', label: 'Jordan', continent: 'Asia' },
  { code: 'kz', value: 'kazakhstan', label: 'Kazakhstan', continent: 'Asia' },
  { code: 'ke', value: 'kenya', label: 'Kenya', continent: 'Africa' },
  { code: 'kw', value: 'kuwait', label: 'Kuwait', continent: 'Asia' },
  { code: 'kg', value: 'kyrgyzstan', label: 'Kyrgyzstan', continent: 'Asia' },
  { code: 'la', value: 'laos', label: 'Laos', continent: 'Asia' },
  { code: 'lv', value: 'latvia', label: 'Latvia', continent: 'Europe' },
  { code: 'lb', value: 'lebanon', label: 'Lebanon', continent: 'Asia' },
  { code: 'ls', value: 'lesotho', label: 'Lesotho', continent: 'Africa' },
  { code: 'lr', value: 'liberia', label: 'Liberia', continent: 'Africa' },
  { code: 'ly', value: 'libya', label: 'Libya', continent: 'Africa' },
  { code: 'li', value: 'liechtenstein', label: 'Liechtenstein', continent: 'Europe' },
  { code: 'lt', value: 'lithuania', label: 'Lithuania', continent: 'Europe' },
  { code: 'lu', value: 'luxembourg', label: 'Luxembourg', continent: 'Europe' },
  { code: 'mg', value: 'madagascar', label: 'Madagascar', continent: 'Africa' },
  { code: 'mw', value: 'malawi', label: 'Malawi', continent: 'Africa' },
  { code: 'my', value: 'malaysia', label: 'Malaysia', continent: 'Asia' },
  { code: 'mv', value: 'maldives', label: 'Maldives', continent: 'Asia' },
  { code: 'ml', value: 'mali', label: 'Mali', continent: 'Africa' },
  { code: 'mt', value: 'malta', label: 'Malta', continent: 'Europe' },
  { code: 'mh', value: 'marshall-islands', label: 'Marshall Islands', continent: 'Oceania' },
  { code: 'mr', value: 'mauritania', label: 'Mauritania', continent: 'Africa' },
  { code: 'mu', value: 'mauritius', label: 'Mauritius', continent: 'Africa' },
  { code: 'mx', value: 'mexico', label: 'Mexico', continent: 'North America' },
  { code: 'fm', value: 'micronesia', label: 'Micronesia', continent: 'Oceania' },
  { code: 'md', value: 'moldova', label: 'Moldova', continent: 'Europe' },
  { code: 'mc', value: 'monaco', label: 'Monaco', continent: 'Europe' },
  { code: 'mn', value: 'mongolia', label: 'Mongolia', continent: 'Asia' },
  { code: 'me', value: 'montenegro', label: 'Montenegro', continent: 'Europe' },
  { code: 'ma', value: 'morocco', label: 'Morocco', continent: 'Africa' },
  { code: 'mz', value: 'mozambique', label: 'Mozambique', continent: 'Africa' },
  { code: 'mm', value: 'myanmar', label: 'Myanmar', continent: 'Asia' },
  { code: 'na', value: 'namibia', label: 'Namibia', continent: 'Africa' },
  { code: 'nr', value: 'nauru', label: 'Nauru', continent: 'Oceania' },
  { code: 'np', value: 'nepal', label: 'Nepal', continent: 'Asia' },
  { code: 'nl', value: 'netherlands', label: 'Netherlands', continent: 'Europe' },
  { code: 'nz', value: 'new-zealand', label: 'New Zealand', continent: 'Oceania' },
  { code: 'ni', value: 'nicaragua', label: 'Nicaragua', continent: 'North America' },
  { code: 'ne', value: 'niger', label: 'Niger', continent: 'Africa' },
  { code: 'ng', value: 'nigeria', label: 'Nigeria', continent: 'Africa' },
  { code: 'kp', value: 'north-korea', label: 'North Korea', continent: 'Asia' },
  { code: 'mk', value: 'north-macedonia', label: 'North Macedonia', continent: 'Europe' },
  { code: 'no', value: 'norway', label: 'Norway', continent: 'Europe' },
  { code: 'om', value: 'oman', label: 'Oman', continent: 'Asia' },
  { code: 'pk', value: 'pakistan', label: 'Pakistan', continent: 'Asia' },
  { code: 'pw', value: 'palau', label: 'Palau', continent: 'Oceania' },
  { code: 'ps', value: 'palestine', label: 'Palestine', continent: 'Asia' },
  { code: 'pa', value: 'panama', label: 'Panama', continent: 'North America' },
  { code: 'pg', value: 'papua-new-guinea', label: 'Papua New Guinea', continent: 'Oceania' },
  { code: 'py', value: 'paraguay', label: 'Paraguay', continent: 'South America' },
  { code: 'pe', value: 'peru', label: 'Peru', continent: 'South America' },
  { code: 'ph', value: 'philippines', label: 'Philippines', continent: 'Asia' },
  { code: 'pl', value: 'poland', label: 'Poland', continent: 'Europe' },
  { code: 'pt', value: 'portugal', label: 'Portugal', continent: 'Europe' },
  { code: 'qa', value: 'qatar', label: 'Qatar', continent: 'Asia' },
  { code: 'ro', value: 'romania', label: 'Romania', continent: 'Europe' },
  { code: 'ru', value: 'russia', label: 'Russia', continent: 'Europe' },
  { code: 'rw', value: 'rwanda', label: 'Rwanda', continent: 'Africa' },
  { code: 'ws', value: 'samoa', label: 'Samoa', continent: 'Oceania' },
  { code: 'sm', value: 'san-marino', label: 'San Marino', continent: 'Europe' },
  { code: 'sa', value: 'saudi-arabia', label: 'Saudi Arabia', continent: 'Asia' },
  { code: 'sn', value: 'senegal', label: 'Senegal', continent: 'Africa' },
  { code: 'rs', value: 'serbia', label: 'Serbia', continent: 'Europe' },
  { code: 'sc', value: 'seychelles', label: 'Seychelles', continent: 'Africa' },
  { code: 'sl', value: 'sierra-leone', label: 'Sierra Leone', continent: 'Africa' },
  { code: 'sg', value: 'singapore', label: 'Singapore', continent: 'Asia' },
  { code: 'sk', value: 'slovakia', label: 'Slovakia', continent: 'Europe' },
  { code: 'si', value: 'slovenia', label: 'Slovenia', continent: 'Europe' },
  { code: 'sb', value: 'solomon-islands', label: 'Solomon Islands', continent: 'Oceania' },
  { code: 'so', value: 'somalia', label: 'Somalia', continent: 'Africa' },
  { code: 'za', value: 'south-africa', label: 'South Africa', continent: 'Africa' },
  { code: 'kr', value: 'south-korea', label: 'South Korea', continent: 'Asia' },
  { code: 'ss', value: 'south-sudan', label: 'South Sudan', continent: 'Africa' },
  { code: 'es', value: 'spain', label: 'Spain', continent: 'Europe' },
  { code: 'lk', value: 'sri-lanka', label: 'Sri Lanka', continent: 'Asia' },
  { code: 'sd', value: 'sudan', label: 'Sudan', continent: 'Africa' },
  { code: 'sr', value: 'suriname', label: 'Suriname', continent: 'South America' },
  { code: 'se', value: 'sweden', label: 'Sweden', continent: 'Europe' },
  { code: 'ch', value: 'switzerland', label: 'Switzerland', continent: 'Europe' },
  { code: 'sy', value: 'syria', label: 'Syria', continent: 'Asia' },
  { code: 'tw', value: 'taiwan', label: 'Taiwan', continent: 'Asia' },
  { code: 'tj', value: 'tajikistan', label: 'Tajikistan', continent: 'Asia' },
  { code: 'tz', value: 'tanzania', label: 'Tanzania', continent: 'Africa' },
  { code: 'th', value: 'thailand', label: 'Thailand', continent: 'Asia' },
  { code: 'tl', value: 'timor-leste', label: 'Timor-Leste', continent: 'Asia' },
  { code: 'tg', value: 'togo', label: 'Togo', continent: 'Africa' },
  { code: 'to', value: 'tonga', label: 'Tonga', continent: 'Oceania' },
  {
    code: 'tt',
    value: 'trinidad-and-tobago',
    label: 'Trinidad and Tobago',
    continent: 'North America',
  },
  { code: 'tn', value: 'tunisia', label: 'Tunisia', continent: 'Africa' },
  { code: 'tr', value: 'turkey', label: 'Turkey', continent: 'Asia' },
  { code: 'tm', value: 'turkmenistan', label: 'Turkmenistan', continent: 'Asia' },
  { code: 'tv', value: 'tuvalu', label: 'Tuvalu', continent: 'Oceania' },
  { code: 'ug', value: 'uganda', label: 'Uganda', continent: 'Africa' },
  { code: 'ua', value: 'ukraine', label: 'Ukraine', continent: 'Europe' },
  { code: 'ae', value: 'united-arab-emirates', label: 'United Arab Emirates', continent: 'Asia' },
  { code: 'gb', value: 'united-kingdom', label: 'United Kingdom', continent: 'Europe' },
  { code: 'us', value: 'united-states', label: 'United States', continent: 'North America' },
  { code: 'uy', value: 'uruguay', label: 'Uruguay', continent: 'South America' },
  { code: 'uz', value: 'uzbekistan', label: 'Uzbekistan', continent: 'Asia' },
  { code: 'vu', value: 'vanuatu', label: 'Vanuatu', continent: 'Oceania' },
  { code: 'va', value: 'vatican-city', label: 'Vatican City', continent: 'Europe' },
  { code: 've', value: 'venezuela', label: 'Venezuela', continent: 'South America' },
  { code: 'vn', value: 'vietnam', label: 'Vietnam', continent: 'Asia' },
  { code: 'ye', value: 'yemen', label: 'Yemen', continent: 'Asia' },
  { code: 'zm', value: 'zambia', label: 'Zambia', continent: 'Africa' },
  { code: 'zw', value: 'zimbabwe', label: 'Zimbabwe', continent: 'Africa' },
];
```

### CSS Modules

This example shows how to implement the component using CSS Modules.

```css
/* index.module.css */
.Trigger {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  height: 2.5rem;
  padding-left: 0.875rem;
  padding-right: 0.75rem;
  margin: 0;
  outline: 0;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--color-gray-900);
  cursor: default;
  background-color: canvas;
  -webkit-user-select: none;
  user-select: none;
  min-width: 12rem;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-100);
    }
  }

  &[data-popup-open] {
    background-color: var(--color-gray-100);
  }

  &:focus-visible {
    outline: 2px solid var(--color-blue);
    outline-offset: -1px;
  }
}

.TriggerIcon {
  display: flex;
}

.InputContainer {
  box-sizing: border-box;
  width: 20rem;
  height: var(--input-container-height);
  text-align: center;
  padding: 0.5rem;
}

.Input {
  box-sizing: border-box;
  padding-left: 0.875rem;
  margin: 0;
  border: 1px solid var(--color-gray-300);
  min-width: 18rem;
  width: 100%;
  height: 2.5rem;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: canvas;
  color: var(--color-gray-900);
  outline: none;

  &:focus {
    border-color: var(--color-blue);
    outline: 1px solid var(--color-blue);
  }
}

.Label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--color-gray-900);
}

.Positioner {
  outline: 0;
}

.Popup {
  --input-container-height: 3rem;
  box-sizing: border-box;
  border-radius: 0.5rem;
  background-color: canvas;
  color: var(--color-gray-900);
  transform-origin: var(--transform-origin);
  transition:
    transform 150ms,
    opacity 150ms;
  max-width: var(--available-width);
  max-height: min(24rem, var(--available-height));

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }

  @media (prefers-color-scheme: light) {
    outline: 1px solid var(--color-gray-200);
    box-shadow:
      0 10px 15px -3px var(--color-gray-200),
      0 4px 6px -4px var(--color-gray-200);
  }

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
    outline-offset: -1px;
  }
}

.List {
  box-sizing: border-box;
  overflow: auto;
  scroll-padding-block: 0.5rem;
  padding-block: 0.5rem;
  overscroll-behavior: contain;
  max-height: min(
    calc(24rem - var(--input-container-height)),
    calc(var(--available-height) - var(--input-container-height))
  );

  &:empty {
    padding: 0;
  }
}

.Item {
  box-sizing: border-box;
  outline: 0;
  cursor: default;
  user-select: none;
  min-width: var(--anchor-width);
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  display: grid;
  gap: 0.5rem;
  align-items: center;
  grid-template-columns: 0.75rem 1fr;
  font-size: 1rem;
  line-height: 1rem;

  &[data-highlighted] {
    z-index: 0;
    position: relative;
    color: var(--color-gray-50);
  }

  &[data-highlighted]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.5rem;
    border-radius: 0.25rem;
    background-color: var(--color-gray-900);
  }
}

.ItemText {
  grid-column-start: 2;
}

.ItemIndicator {
  grid-column-start: 1;
}

.ItemIndicatorIcon {
  display: block;
  width: 0.75rem;
  height: 0.75rem;
}

.Separator {
  margin: 0.375rem 1rem;
  height: 1px;
  background-color: var(--color-gray-200);
}

.Empty:not(:empty) {
  box-sizing: border-box;
  font-size: 0.925rem;
  line-height: 1rem;
  color: var(--color-gray-600);
  padding: 1rem;
}
```

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import styles from './index.module.css';

export default function ExamplePopoverCombobox() {
  return (
    <Combobox.Root items={countries} defaultValue={countries[0]}>
      <Combobox.Trigger className={styles.Trigger}>
        <Combobox.Value />
        <Combobox.Icon className={styles.TriggerIcon}>
          <ChevronUpDownIcon />
        </Combobox.Icon>
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner align="start" sideOffset={4}>
          <Combobox.Popup className={styles.Popup} aria-label="Select country">
            <div className={styles.InputContainer}>
              <Combobox.Input placeholder="e.g. United Kingdom" className={styles.Input} />
            </div>
            <Combobox.Empty className={styles.Empty}>No countries found.</Combobox.Empty>
            <Combobox.List className={styles.List}>
              {(country: Country) => (
                <Combobox.Item key={country.code} value={country} className={styles.Item}>
                  <Combobox.ItemIndicator className={styles.ItemIndicator}>
                    <CheckIcon className={styles.ItemIndicatorIcon} />
                  </Combobox.ItemIndicator>
                  <div className={styles.ItemText}>{country.label ?? country.value}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function ChevronUpDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.5"
      {...props}
    >
      <path d="M0.5 4.5L4 1.5L7.5 4.5" />
      <path d="M0.5 7.5L4 10.5L7.5 7.5" />
    </svg>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

interface Country {
  code: string;
  value: string | null;
  continent: string;
  label: string;
}

const countries: Country[] = [
  { code: '', value: null, continent: '', label: 'Select country' },
  { code: 'af', value: 'afghanistan', label: 'Afghanistan', continent: 'Asia' },
  { code: 'al', value: 'albania', label: 'Albania', continent: 'Europe' },
  { code: 'dz', value: 'algeria', label: 'Algeria', continent: 'Africa' },
  { code: 'ad', value: 'andorra', label: 'Andorra', continent: 'Europe' },
  { code: 'ao', value: 'angola', label: 'Angola', continent: 'Africa' },
  { code: 'ar', value: 'argentina', label: 'Argentina', continent: 'South America' },
  { code: 'am', value: 'armenia', label: 'Armenia', continent: 'Asia' },
  { code: 'au', value: 'australia', label: 'Australia', continent: 'Oceania' },
  { code: 'at', value: 'austria', label: 'Austria', continent: 'Europe' },
  { code: 'az', value: 'azerbaijan', label: 'Azerbaijan', continent: 'Asia' },
  { code: 'bs', value: 'bahamas', label: 'Bahamas', continent: 'North America' },
  { code: 'bh', value: 'bahrain', label: 'Bahrain', continent: 'Asia' },
  { code: 'bd', value: 'bangladesh', label: 'Bangladesh', continent: 'Asia' },
  { code: 'bb', value: 'barbados', label: 'Barbados', continent: 'North America' },
  { code: 'by', value: 'belarus', label: 'Belarus', continent: 'Europe' },
  { code: 'be', value: 'belgium', label: 'Belgium', continent: 'Europe' },
  { code: 'bz', value: 'belize', label: 'Belize', continent: 'North America' },
  { code: 'bj', value: 'benin', label: 'Benin', continent: 'Africa' },
  { code: 'bt', value: 'bhutan', label: 'Bhutan', continent: 'Asia' },
  { code: 'bo', value: 'bolivia', label: 'Bolivia', continent: 'South America' },
  {
    code: 'ba',
    value: 'bosnia-and-herzegovina',
    label: 'Bosnia and Herzegovina',
    continent: 'Europe',
  },
  { code: 'bw', value: 'botswana', label: 'Botswana', continent: 'Africa' },
  { code: 'br', value: 'brazil', label: 'Brazil', continent: 'South America' },
  { code: 'bn', value: 'brunei', label: 'Brunei', continent: 'Asia' },
  { code: 'bg', value: 'bulgaria', label: 'Bulgaria', continent: 'Europe' },
  { code: 'bf', value: 'burkina-faso', label: 'Burkina Faso', continent: 'Africa' },
  { code: 'bi', value: 'burundi', label: 'Burundi', continent: 'Africa' },
  { code: 'kh', value: 'cambodia', label: 'Cambodia', continent: 'Asia' },
  { code: 'cm', value: 'cameroon', label: 'Cameroon', continent: 'Africa' },
  { code: 'ca', value: 'canada', label: 'Canada', continent: 'North America' },
  { code: 'cv', value: 'cape-verde', label: 'Cape Verde', continent: 'Africa' },
  {
    code: 'cf',
    value: 'central-african-republic',
    label: 'Central African Republic',
    continent: 'Africa',
  },
  { code: 'td', value: 'chad', label: 'Chad', continent: 'Africa' },
  { code: 'cl', value: 'chile', label: 'Chile', continent: 'South America' },
  { code: 'cn', value: 'china', label: 'China', continent: 'Asia' },
  { code: 'co', value: 'colombia', label: 'Colombia', continent: 'South America' },
  { code: 'km', value: 'comoros', label: 'Comoros', continent: 'Africa' },
  { code: 'cg', value: 'congo', label: 'Congo', continent: 'Africa' },
  { code: 'cr', value: 'costa-rica', label: 'Costa Rica', continent: 'North America' },
  { code: 'hr', value: 'croatia', label: 'Croatia', continent: 'Europe' },
  { code: 'cu', value: 'cuba', label: 'Cuba', continent: 'North America' },
  { code: 'cy', value: 'cyprus', label: 'Cyprus', continent: 'Asia' },
  { code: 'cz', value: 'czech-republic', label: 'Czech Republic', continent: 'Europe' },
  { code: 'dk', value: 'denmark', label: 'Denmark', continent: 'Europe' },
  { code: 'dj', value: 'djibouti', label: 'Djibouti', continent: 'Africa' },
  { code: 'dm', value: 'dominica', label: 'Dominica', continent: 'North America' },
  {
    code: 'do',
    value: 'dominican-republic',
    label: 'Dominican Republic',
    continent: 'North America',
  },
  { code: 'ec', value: 'ecuador', label: 'Ecuador', continent: 'South America' },
  { code: 'eg', value: 'egypt', label: 'Egypt', continent: 'Africa' },
  { code: 'sv', value: 'el-salvador', label: 'El Salvador', continent: 'North America' },
  { code: 'gq', value: 'equatorial-guinea', label: 'Equatorial Guinea', continent: 'Africa' },
  { code: 'er', value: 'eritrea', label: 'Eritrea', continent: 'Africa' },
  { code: 'ee', value: 'estonia', label: 'Estonia', continent: 'Europe' },
  { code: 'et', value: 'ethiopia', label: 'Ethiopia', continent: 'Africa' },
  { code: 'fj', value: 'fiji', label: 'Fiji', continent: 'Oceania' },
  { code: 'fi', value: 'finland', label: 'Finland', continent: 'Europe' },
  { code: 'fr', value: 'france', label: 'France', continent: 'Europe' },
  { code: 'ga', value: 'gabon', label: 'Gabon', continent: 'Africa' },
  { code: 'gm', value: 'gambia', label: 'Gambia', continent: 'Africa' },
  { code: 'ge', value: 'georgia', label: 'Georgia', continent: 'Asia' },
  { code: 'de', value: 'germany', label: 'Germany', continent: 'Europe' },
  { code: 'gh', value: 'ghana', label: 'Ghana', continent: 'Africa' },
  { code: 'gr', value: 'greece', label: 'Greece', continent: 'Europe' },
  { code: 'gd', value: 'grenada', label: 'Grenada', continent: 'North America' },
  { code: 'gt', value: 'guatemala', label: 'Guatemala', continent: 'North America' },
  { code: 'gn', value: 'guinea', label: 'Guinea', continent: 'Africa' },
  { code: 'gw', value: 'guinea-bissau', label: 'Guinea-Bissau', continent: 'Africa' },
  { code: 'gy', value: 'guyana', label: 'Guyana', continent: 'South America' },
  { code: 'ht', value: 'haiti', label: 'Haiti', continent: 'North America' },
  { code: 'hn', value: 'honduras', label: 'Honduras', continent: 'North America' },
  { code: 'hu', value: 'hungary', label: 'Hungary', continent: 'Europe' },
  { code: 'is', value: 'iceland', label: 'Iceland', continent: 'Europe' },
  { code: 'in', value: 'india', label: 'India', continent: 'Asia' },
  { code: 'id', value: 'indonesia', label: 'Indonesia', continent: 'Asia' },
  { code: 'ir', value: 'iran', label: 'Iran', continent: 'Asia' },
  { code: 'iq', value: 'iraq', label: 'Iraq', continent: 'Asia' },
  { code: 'ie', value: 'ireland', label: 'Ireland', continent: 'Europe' },
  { code: 'il', value: 'israel', label: 'Israel', continent: 'Asia' },
  { code: 'it', value: 'italy', label: 'Italy', continent: 'Europe' },
  { code: 'jm', value: 'jamaica', label: 'Jamaica', continent: 'North America' },
  { code: 'jp', value: 'japan', label: 'Japan', continent: 'Asia' },
  { code: 'jo', value: 'jordan', label: 'Jordan', continent: 'Asia' },
  { code: 'kz', value: 'kazakhstan', label: 'Kazakhstan', continent: 'Asia' },
  { code: 'ke', value: 'kenya', label: 'Kenya', continent: 'Africa' },
  { code: 'kw', value: 'kuwait', label: 'Kuwait', continent: 'Asia' },
  { code: 'kg', value: 'kyrgyzstan', label: 'Kyrgyzstan', continent: 'Asia' },
  { code: 'la', value: 'laos', label: 'Laos', continent: 'Asia' },
  { code: 'lv', value: 'latvia', label: 'Latvia', continent: 'Europe' },
  { code: 'lb', value: 'lebanon', label: 'Lebanon', continent: 'Asia' },
  { code: 'ls', value: 'lesotho', label: 'Lesotho', continent: 'Africa' },
  { code: 'lr', value: 'liberia', label: 'Liberia', continent: 'Africa' },
  { code: 'ly', value: 'libya', label: 'Libya', continent: 'Africa' },
  { code: 'li', value: 'liechtenstein', label: 'Liechtenstein', continent: 'Europe' },
  { code: 'lt', value: 'lithuania', label: 'Lithuania', continent: 'Europe' },
  { code: 'lu', value: 'luxembourg', label: 'Luxembourg', continent: 'Europe' },
  { code: 'mg', value: 'madagascar', label: 'Madagascar', continent: 'Africa' },
  { code: 'mw', value: 'malawi', label: 'Malawi', continent: 'Africa' },
  { code: 'my', value: 'malaysia', label: 'Malaysia', continent: 'Asia' },
  { code: 'mv', value: 'maldives', label: 'Maldives', continent: 'Asia' },
  { code: 'ml', value: 'mali', label: 'Mali', continent: 'Africa' },
  { code: 'mt', value: 'malta', label: 'Malta', continent: 'Europe' },
  { code: 'mh', value: 'marshall-islands', label: 'Marshall Islands', continent: 'Oceania' },
  { code: 'mr', value: 'mauritania', label: 'Mauritania', continent: 'Africa' },
  { code: 'mu', value: 'mauritius', label: 'Mauritius', continent: 'Africa' },
  { code: 'mx', value: 'mexico', label: 'Mexico', continent: 'North America' },
  { code: 'fm', value: 'micronesia', label: 'Micronesia', continent: 'Oceania' },
  { code: 'md', value: 'moldova', label: 'Moldova', continent: 'Europe' },
  { code: 'mc', value: 'monaco', label: 'Monaco', continent: 'Europe' },
  { code: 'mn', value: 'mongolia', label: 'Mongolia', continent: 'Asia' },
  { code: 'me', value: 'montenegro', label: 'Montenegro', continent: 'Europe' },
  { code: 'ma', value: 'morocco', label: 'Morocco', continent: 'Africa' },
  { code: 'mz', value: 'mozambique', label: 'Mozambique', continent: 'Africa' },
  { code: 'mm', value: 'myanmar', label: 'Myanmar', continent: 'Asia' },
  { code: 'na', value: 'namibia', label: 'Namibia', continent: 'Africa' },
  { code: 'nr', value: 'nauru', label: 'Nauru', continent: 'Oceania' },
  { code: 'np', value: 'nepal', label: 'Nepal', continent: 'Asia' },
  { code: 'nl', value: 'netherlands', label: 'Netherlands', continent: 'Europe' },
  { code: 'nz', value: 'new-zealand', label: 'New Zealand', continent: 'Oceania' },
  { code: 'ni', value: 'nicaragua', label: 'Nicaragua', continent: 'North America' },
  { code: 'ne', value: 'niger', label: 'Niger', continent: 'Africa' },
  { code: 'ng', value: 'nigeria', label: 'Nigeria', continent: 'Africa' },
  { code: 'kp', value: 'north-korea', label: 'North Korea', continent: 'Asia' },
  { code: 'mk', value: 'north-macedonia', label: 'North Macedonia', continent: 'Europe' },
  { code: 'no', value: 'norway', label: 'Norway', continent: 'Europe' },
  { code: 'om', value: 'oman', label: 'Oman', continent: 'Asia' },
  { code: 'pk', value: 'pakistan', label: 'Pakistan', continent: 'Asia' },
  { code: 'pw', value: 'palau', label: 'Palau', continent: 'Oceania' },
  { code: 'ps', value: 'palestine', label: 'Palestine', continent: 'Asia' },
  { code: 'pa', value: 'panama', label: 'Panama', continent: 'North America' },
  { code: 'pg', value: 'papua-new-guinea', label: 'Papua New Guinea', continent: 'Oceania' },
  { code: 'py', value: 'paraguay', label: 'Paraguay', continent: 'South America' },
  { code: 'pe', value: 'peru', label: 'Peru', continent: 'South America' },
  { code: 'ph', value: 'philippines', label: 'Philippines', continent: 'Asia' },
  { code: 'pl', value: 'poland', label: 'Poland', continent: 'Europe' },
  { code: 'pt', value: 'portugal', label: 'Portugal', continent: 'Europe' },
  { code: 'qa', value: 'qatar', label: 'Qatar', continent: 'Asia' },
  { code: 'ro', value: 'romania', label: 'Romania', continent: 'Europe' },
  { code: 'ru', value: 'russia', label: 'Russia', continent: 'Europe' },
  { code: 'rw', value: 'rwanda', label: 'Rwanda', continent: 'Africa' },
  { code: 'ws', value: 'samoa', label: 'Samoa', continent: 'Oceania' },
  { code: 'sm', value: 'san-marino', label: 'San Marino', continent: 'Europe' },
  { code: 'sa', value: 'saudi-arabia', label: 'Saudi Arabia', continent: 'Asia' },
  { code: 'sn', value: 'senegal', label: 'Senegal', continent: 'Africa' },
  { code: 'rs', value: 'serbia', label: 'Serbia', continent: 'Europe' },
  { code: 'sc', value: 'seychelles', label: 'Seychelles', continent: 'Africa' },
  { code: 'sl', value: 'sierra-leone', label: 'Sierra Leone', continent: 'Africa' },
  { code: 'sg', value: 'singapore', label: 'Singapore', continent: 'Asia' },
  { code: 'sk', value: 'slovakia', label: 'Slovakia', continent: 'Europe' },
  { code: 'si', value: 'slovenia', label: 'Slovenia', continent: 'Europe' },
  { code: 'sb', value: 'solomon-islands', label: 'Solomon Islands', continent: 'Oceania' },
  { code: 'so', value: 'somalia', label: 'Somalia', continent: 'Africa' },
  { code: 'za', value: 'south-africa', label: 'South Africa', continent: 'Africa' },
  { code: 'kr', value: 'south-korea', label: 'South Korea', continent: 'Asia' },
  { code: 'ss', value: 'south-sudan', label: 'South Sudan', continent: 'Africa' },
  { code: 'es', value: 'spain', label: 'Spain', continent: 'Europe' },
  { code: 'lk', value: 'sri-lanka', label: 'Sri Lanka', continent: 'Asia' },
  { code: 'sd', value: 'sudan', label: 'Sudan', continent: 'Africa' },
  { code: 'sr', value: 'suriname', label: 'Suriname', continent: 'South America' },
  { code: 'se', value: 'sweden', label: 'Sweden', continent: 'Europe' },
  { code: 'ch', value: 'switzerland', label: 'Switzerland', continent: 'Europe' },
  { code: 'sy', value: 'syria', label: 'Syria', continent: 'Asia' },
  { code: 'tw', value: 'taiwan', label: 'Taiwan', continent: 'Asia' },
  { code: 'tj', value: 'tajikistan', label: 'Tajikistan', continent: 'Asia' },
  { code: 'tz', value: 'tanzania', label: 'Tanzania', continent: 'Africa' },
  { code: 'th', value: 'thailand', label: 'Thailand', continent: 'Asia' },
  { code: 'tl', value: 'timor-leste', label: 'Timor-Leste', continent: 'Asia' },
  { code: 'tg', value: 'togo', label: 'Togo', continent: 'Africa' },
  { code: 'to', value: 'tonga', label: 'Tonga', continent: 'Oceania' },
  {
    code: 'tt',
    value: 'trinidad-and-tobago',
    label: 'Trinidad and Tobago',
    continent: 'North America',
  },
  { code: 'tn', value: 'tunisia', label: 'Tunisia', continent: 'Africa' },
  { code: 'tr', value: 'turkey', label: 'Turkey', continent: 'Asia' },
  { code: 'tm', value: 'turkmenistan', label: 'Turkmenistan', continent: 'Asia' },
  { code: 'tv', value: 'tuvalu', label: 'Tuvalu', continent: 'Oceania' },
  { code: 'ug', value: 'uganda', label: 'Uganda', continent: 'Africa' },
  { code: 'ua', value: 'ukraine', label: 'Ukraine', continent: 'Europe' },
  { code: 'ae', value: 'united-arab-emirates', label: 'United Arab Emirates', continent: 'Asia' },
  { code: 'gb', value: 'united-kingdom', label: 'United Kingdom', continent: 'Europe' },
  { code: 'us', value: 'united-states', label: 'United States', continent: 'North America' },
  { code: 'uy', value: 'uruguay', label: 'Uruguay', continent: 'South America' },
  { code: 'uz', value: 'uzbekistan', label: 'Uzbekistan', continent: 'Asia' },
  { code: 'vu', value: 'vanuatu', label: 'Vanuatu', continent: 'Oceania' },
  { code: 'va', value: 'vatican-city', label: 'Vatican City', continent: 'Europe' },
  { code: 've', value: 'venezuela', label: 'Venezuela', continent: 'South America' },
  { code: 'vn', value: 'vietnam', label: 'Vietnam', continent: 'Asia' },
  { code: 'ye', value: 'yemen', label: 'Yemen', continent: 'Asia' },
  { code: 'zm', value: 'zambia', label: 'Zambia', continent: 'Africa' },
  { code: 'zw', value: 'zimbabwe', label: 'Zimbabwe', continent: 'Africa' },
];
```

### Creatable

Create a new item when the filter matches no items, opening a creation `Dialog`.

## Demo

### Tailwind

This example shows how to implement the component using Tailwind CSS.

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import { Dialog } from '@base-ui-components/react/dialog';

export default function ExampleCreatableCombobox() {
  const id = React.useId();

  const [labels, setLabels] = React.useState<LabelItem[]>(initialLabels);
  const [selected, setSelected] = React.useState<LabelItem[]>([]);
  const [query, setQuery] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const createInputRef = React.useRef<HTMLInputElement | null>(null);
  const comboboxInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingQueryRef = React.useRef('');

  function handleCreate() {
    const input = createInputRef.current || comboboxInputRef.current;
    const value = input ? input.value.trim() : '';
    if (!value) {
      return;
    }

    const normalized = value.toLocaleLowerCase();
    const baseId = normalized.replace(/\s+/g, '-');
    const existing = labels.find((l) => l.value.trim().toLocaleLowerCase() === normalized);

    if (existing) {
      setSelected((prev) => (prev.some((i) => i.id === existing.id) ? prev : [...prev, existing]));
      setOpenDialog(false);
      setQuery('');
      return;
    }

    const existingIds = new Set(labels.map((l) => l.id));
    let uniqueId = baseId;
    if (existingIds.has(uniqueId)) {
      let i = 2;
      while (existingIds.has(`${baseId}-${i}`)) {
        i += 1;
      }
      uniqueId = `${baseId}-${i}`;
    }

    const newItem: LabelItem = { id: uniqueId, value };

    if (!selected.find((item) => item.id === newItem.id)) {
      setLabels((prev) => [...prev, newItem]);
      setSelected((prev) => [...prev, newItem]);
    }

    setOpenDialog(false);
    setQuery('');
  }

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleCreate();
  }

  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const exactExists = labels.some((l) => l.value.trim().toLocaleLowerCase() === lowered);
  const itemsForView: Array<LabelItem> =
    trimmed !== '' && !exactExists
      ? [...labels, { creatable: trimmed, id: `create:${lowered}`, value: `Create "${trimmed}"` }]
      : labels;

  return (
    <React.Fragment>
      <Combobox.Root
        items={itemsForView}
        multiple
        onValueChange={(next) => {
          const last = next[next.length - 1];
          if (last && last.creatable) {
            pendingQueryRef.current = last.creatable;
            setOpenDialog(true);
            return;
          }
          const clean = next.filter((i) => !i.creatable);
          setSelected(clean);
          setQuery('');
        }}
        value={selected}
        inputValue={query}
        onInputValueChange={setQuery}
        onOpenChange={(open, details) => {
          if ('key' in details.event && details.event.key === 'Enter') {
            if (trimmed === '') {
              return;
            }

            const existing = labels.find((l) => l.value.trim().toLocaleLowerCase() === lowered);

            if (existing) {
              setSelected((prev) =>
                prev.some((i) => i.id === existing.id) ? prev : [...prev, existing],
              );
              setQuery('');
              return;
            }

            pendingQueryRef.current = trimmed;
            setOpenDialog(true);
          }
        }}
      >
        <div className="max-w-112 flex flex-col gap-1">
          <label className="text-sm leading-5 font-medium text-gray-900" htmlFor={id}>
            Labels
          </label>
          <Combobox.Chips
            className="flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 px-1.5 py-1 w-64 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800 min-[500px]:w-[22rem]"
            ref={containerRef}
          >
            <Combobox.Value>
              {(value: LabelItem[]) => (
                <React.Fragment>
                  {value.map((label) => (
                    <Combobox.Chip
                      key={label.id}
                      className="flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-[0.2rem] text-sm text-gray-900 outline-none cursor-default [@media(hover:hover)]:[&[data-highlighted]]:bg-blue-800 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 focus-within:bg-blue-800 focus-within:text-gray-50"
                      aria-label={label.value}
                    >
                      {label.value}
                      <Combobox.ChipRemove
                        className="rounded-md p-1 text-inherit hover:bg-gray-200"
                        aria-label="Remove"
                      >
                        <XIcon />
                      </Combobox.ChipRemove>
                    </Combobox.Chip>
                  ))}
                  <Combobox.Input
                    ref={comboboxInputRef}
                    id={id}
                    placeholder={value.length > 0 ? '' : 'e.g. bug'}
                    className="min-w-12 flex-1 h-8 rounded-md border-0 bg-transparent pl-2 text-base text-gray-900 outline-none"
                  />
                </React.Fragment>
              )}
            </Combobox.Value>
          </Combobox.Chips>
        </div>

        <Combobox.Portal>
          <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef}>
            <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),24rem)] max-w-[var(--available-width)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-lg bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
              <Combobox.Empty className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
                No labels found.
              </Combobox.Empty>
              <Combobox.List>
                {(item: LabelItem) =>
                  item.creatable ? (
                    <Combobox.Item
                      key={item.id}
                      className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                    >
                      <span className="col-start-1">
                        <PlusIcon className="size-3" />
                      </span>
                      <div className="col-start-2">Create "{item.creatable}"</div>
                    </Combobox.Item>
                  ) : (
                    <Combobox.Item
                      key={item.id}
                      className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                      value={item}
                    >
                      <Combobox.ItemIndicator className="col-start-1">
                        <CheckIcon className="size-3" />
                      </Combobox.ItemIndicator>
                      <div className="col-start-2">{item.value}</div>
                    </Combobox.Item>
                  )
                }
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-opacity dark:opacity-70 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
          <Dialog.Popup
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-2rem] w-[24rem] max-w-[calc(100vw-3rem)] rounded-lg bg-[canvas] p-6 text-gray-900 outline-1 outline-gray-200 transition-all data-[starting-style]:opacity-0 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:scale-90 dark:-outline-offset-1 dark:outline-gray-300"
            initialFocus={createInputRef}
          >
            <Dialog.Title className="-mt-1.5 mb-1 text-lg leading-7 tracking-[-0.0025em] font-medium">
              Create new label
            </Dialog.Title>
            <Dialog.Description className="mb-4 text-base leading-6 text-gray-600">
              Add a new label to select.
            </Dialog.Description>
            <form onSubmit={handleCreateSubmit}>
              <input
                ref={createInputRef}
                className="w-full h-10 rounded-md border border-gray-200 bg-[canvas] text-gray-900 px-2.5 outline-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800"
                placeholder="Label name"
                defaultValue={pendingQueryRef.current}
              />
              <div className="mt-4 flex justify-end gap-4">
                <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100"
                >
                  Create
                </button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </React.Fragment>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden
      {...props}
    >
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

function XIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface LabelItem {
  creatable?: string;
  id: string;
  value: string;
}

const initialLabels: LabelItem[] = [
  { id: 'bug', value: 'bug' },
  { id: 'docs', value: 'documentation' },
  { id: 'enhancement', value: 'enhancement' },
  { id: 'help-wanted', value: 'help wanted' },
  { id: 'good-first-issue', value: 'good first issue' },
];
```

### CSS Modules

This example shows how to implement the component using CSS Modules.

```css
/* index.module.css */
.Container {
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.Label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--color-gray-900);
}

.Chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.125rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  padding: 0.25rem 0.375rem;
  width: 16rem;

  &:focus-within {
    outline: 2px solid var(--color-blue);
    outline-offset: 2px;
    outline-offset: -1px;
  }

  @media (min-width: 500px) {
    width: 22rem;
  }
}

.Chip {
  display: flex;
  align-items: center;
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  padding: 0.2rem 0.2rem 0.2rem 0.4rem;
  overflow: hidden;
  gap: 0.25rem;
  outline: 0;
  cursor: default;

  &:focus-within {
    background-color: var(--color-blue);
    color: var(--color-gray-50);
  }

  @media (hover: hover) {
    &[data-highlighted] {
      background-color: var(--color-blue);
      color: var(--color-gray-50);
    }
  }
}

.ChipRemove {
  border: none;
  background: none;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  border-radius: 0.375rem;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.Input {
  flex: 1;
  box-sizing: border-box;
  padding-left: 0.5rem;
  margin: 0;
  border: none;
  height: 2rem;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: transparent;
  color: var(--color-gray-900);
  min-width: 3rem;

  &:focus {
    outline: none;
  }
}

.Positioner {
  outline: 0;
  z-index: 50;
}

.Popup {
  box-sizing: border-box;
  border-radius: 0.5rem;
  padding-block: 0.5rem;
  background-color: canvas;
  color: var(--color-gray-900);
  width: var(--anchor-width);
  max-width: var(--available-width);
  max-height: min(var(--available-height), 24rem);
  overflow-y: auto;
  scroll-padding-block: 0.5rem;
  overscroll-behavior: contain;

  @media (prefers-color-scheme: light) {
    outline: 1px solid var(--color-gray-200);
    box-shadow:
      0 10px 15px -3px var(--color-gray-200),
      0 4px 6px -4px var(--color-gray-200);
  }

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
    outline-offset: -1px;
  }
}

.Item {
  box-sizing: border-box;
  outline: 0;
  cursor: default;
  user-select: none;
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  display: grid;
  gap: 0.5rem;
  align-items: center;
  grid-template-columns: 0.75rem 1fr;
  font-size: 1rem;
  line-height: 1rem;

  &[data-selected] {
    z-index: 0;
    position: relative;
    color: var(--color-gray-900);
  }

  &[data-selected]::before,
  &[data-highlighted]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.5rem;
    border-radius: 0.25rem;
  }

  @media (hover: hover) {
    &[data-highlighted] {
      z-index: 0;
      position: relative;
      color: var(--color-gray-50);
    }

    &[data-highlighted]::before {
      background-color: var(--color-gray-900);
    }
  }
}

.ItemText {
  grid-column-start: 2;
}

.ItemIndicator {
  grid-column-start: 1;
}

.ItemIndicatorIcon {
  display: block;
  width: 0.75rem;
  height: 0.75rem;
}

.Empty:not(:empty) {
  box-sizing: border-box;
  font-size: 0.925rem;
  line-height: 1rem;
  color: var(--color-gray-600);
  padding: 0.5rem 1rem;
}

/* Creatable option styling */
.CreateButton {
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: 0.75rem 1fr;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: none;
  text-align: left;
  color: var(--color-gray-900);
  padding: 0.5rem 2rem 0.5rem 1rem;
  cursor: default;
  border-radius: 0.25rem;
}

.CreateIcon {
  width: 0.75rem;
  height: 0.75rem;
}

.CreateText {
  grid-column-start: 2;
}

/* Dialog styles (reused from dialog hero demo) */
.Backdrop {
  position: fixed;
  inset: 0;
  background-color: black;
  opacity: 0.2;
  transition: opacity 150ms cubic-bezier(0.45, 1.005, 0, 1.005);

  @media (prefers-color-scheme: dark) {
    opacity: 0.7;
  }

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }
}

.DialogPopup {
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24rem;
  max-width: calc(100vw - 3rem);
  margin-top: -2rem;
  padding: 1.5rem;
  border-radius: 0.5rem;
  outline: 1px solid var(--color-gray-200);
  background-color: canvas;
  color: var(--color-gray-900);
  transition: all 150ms;

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
  }

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
}

.Title {
  margin-top: -0.375rem;
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  letter-spacing: -0.0025em;
  font-weight: 500;
}

.Description {
  margin: 0 0 1rem;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--color-gray-600);
}

.TextField {
  box-sizing: border-box;
  width: 100%;
  height: 2.5rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  background-color: canvas;
  color: var(--color-gray-900);
  padding: 0 0.625rem;
  font: inherit;

  &:focus-visible {
    outline: 2px solid var(--color-blue);
    outline-offset: -1px;
  }
}

.Actions {
  display: flex;
  justify-content: end;
  gap: 1rem;
  margin-top: 1rem;
}

.Button {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0 0.875rem;
  margin: 0;
  outline: 0;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  background-color: var(--color-gray-50);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--color-gray-900);
  user-select: none;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-100);
    }
  }

  &:active {
    background-color: var(--color-gray-100);
  }

  &:focus-visible {
    outline: 2px solid var(--color-blue);
    outline-offset: -1px;
  }
}
```

```tsx
/* index.tsx */
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import { Dialog } from '@base-ui-components/react/dialog';
import styles from './index.module.css';

export default function ExampleCreatableCombobox() {
  const id = React.useId();

  const [labels, setLabels] = React.useState<LabelItem[]>(initialLabels);
  const [selected, setSelected] = React.useState<LabelItem[]>([]);
  const [query, setQuery] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const createInputRef = React.useRef<HTMLInputElement | null>(null);
  const comboboxInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingQueryRef = React.useRef('');

  function handleCreate() {
    const input = createInputRef.current || comboboxInputRef.current;
    const value = input ? input.value.trim() : '';
    if (!value) {
      return;
    }

    const normalized = value.toLocaleLowerCase();
    const baseId = normalized.replace(/\s+/g, '-');
    const existing = labels.find((l) => l.value.trim().toLocaleLowerCase() === normalized);

    if (existing) {
      setSelected((prev) => (prev.some((i) => i.id === existing.id) ? prev : [...prev, existing]));
      setOpenDialog(false);
      setQuery('');
      return;
    }

    // Ensure we don't collide with an existing id (e.g., value "docs" vs. existing id "docs")
    const existingIds = new Set(labels.map((l) => l.id));
    let uniqueId = baseId;
    if (existingIds.has(uniqueId)) {
      let i = 2;
      while (existingIds.has(`${baseId}-${i}`)) {
        i += 1;
      }
      uniqueId = `${baseId}-${i}`;
    }

    const newItem: LabelItem = { id: uniqueId, value };

    if (!selected.find((item) => item.id === newItem.id)) {
      setLabels((prev) => [...prev, newItem]);
      setSelected((prev) => [...prev, newItem]);
    }

    setOpenDialog(false);
    setQuery('');
  }

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleCreate();
  }

  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const exactExists = labels.some((l) => l.value.trim().toLocaleLowerCase() === lowered);
  // Show the creatable item alongside matches if there's no exact match
  const itemsForView: Array<LabelItem> =
    trimmed !== '' && !exactExists
      ? [...labels, { creatable: trimmed, id: `create:${lowered}`, value: `Create "${trimmed}"` }]
      : labels;

  return (
    <React.Fragment>
      <Combobox.Root
        items={itemsForView}
        multiple
        onValueChange={(next) => {
          const last = next[next.length - 1];
          if (last && last.creatable) {
            pendingQueryRef.current = last.creatable;
            setOpenDialog(true);
            return;
          }
          const clean = next.filter((i) => !i.creatable);
          setSelected(clean);
          setQuery('');
        }}
        value={selected}
        inputValue={query}
        onInputValueChange={setQuery}
        onOpenChange={(open, details) => {
          if ('key' in details.event && details.event.key === 'Enter') {
            // When pressing Enter:
            // - If the typed value exactly matches an existing item, add that item to the selected chips
            // - Otherwise, create a new item
            if (trimmed === '') {
              return;
            }

            const existing = labels.find((l) => l.value.trim().toLocaleLowerCase() === lowered);

            if (existing) {
              setSelected((prev) =>
                prev.some((i) => i.id === existing.id) ? prev : [...prev, existing],
              );
              setQuery('');
              return;
            }

            pendingQueryRef.current = trimmed;
            setOpenDialog(true);
          }
        }}
      >
        <div className={styles.Container}>
          <label className={styles.Label} htmlFor={id}>
            Labels
          </label>
          <Combobox.Chips className={styles.Chips} ref={containerRef}>
            <Combobox.Value>
              {(value: LabelItem[]) => (
                <React.Fragment>
                  {value.map((label) => (
                    <Combobox.Chip key={label.id} className={styles.Chip} aria-label={label.value}>
                      {label.value}
                      <Combobox.ChipRemove className={styles.ChipRemove} aria-label="Remove">
                        <XIcon />
                      </Combobox.ChipRemove>
                    </Combobox.Chip>
                  ))}
                  <Combobox.Input
                    ref={comboboxInputRef}
                    id={id}
                    placeholder={value.length > 0 ? '' : 'e.g. bug'}
                    className={styles.Input}
                  />
                </React.Fragment>
              )}
            </Combobox.Value>
          </Combobox.Chips>
        </div>

        <Combobox.Portal>
          <Combobox.Positioner className={styles.Positioner} sideOffset={4} anchor={containerRef}>
            <Combobox.Popup className={styles.Popup}>
              <Combobox.Empty className={styles.Empty}>No labels found.</Combobox.Empty>
              <Combobox.List>
                {(item: LabelItem) =>
                  item.creatable ? (
                    <Combobox.Item key={item.id} className={styles.Item} value={item}>
                      <span className={styles.ItemIndicator}>
                        <PlusIcon className={styles.CreateIcon} />
                      </span>
                      <div className={styles.ItemText}>Create "{item.creatable}"</div>
                    </Combobox.Item>
                  ) : (
                    <Combobox.Item key={item.id} className={styles.Item} value={item}>
                      <Combobox.ItemIndicator className={styles.ItemIndicator}>
                        <CheckIcon className={styles.ItemIndicatorIcon} />
                      </Combobox.ItemIndicator>
                      <div className={styles.ItemText}>{item.value}</div>
                    </Combobox.Item>
                  )
                }
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.Backdrop} />
          <Dialog.Popup className={styles.DialogPopup} initialFocus={createInputRef}>
            <Dialog.Title className={styles.Title}>Create new label</Dialog.Title>
            <Dialog.Description className={styles.Description}>
              Add a new label to select.
            </Dialog.Description>
            <form onSubmit={handleCreateSubmit}>
              <input
                ref={createInputRef}
                className={styles.TextField}
                placeholder="Label name"
                defaultValue={pendingQueryRef.current}
              />
              <div className={styles.Actions}>
                <Dialog.Close className={styles.Button}>Cancel</Dialog.Close>
                <button type="submit" className={styles.Button}>
                  Create
                </button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </React.Fragment>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden
      {...props}
    >
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

function XIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface LabelItem {
  creatable?: string;
  id: string;
  value: string;
}

const initialLabels: LabelItem[] = [
  { id: 'bug', value: 'bug' },
  { id: 'docs', value: 'documentation' },
  { id: 'enhancement', value: 'enhancement' },
  { id: 'help-wanted', value: 'help wanted' },
  { id: 'good-first-issue', value: 'good first issue' },
];
```

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/react-virtual`.

## Demo

### Tailwind

This example shows how to implement the component using Tailwind CSS.

```tsx
/* index.tsx */
'use client';
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function ExampleVirtualizedCombobox() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [value, setValue] = React.useState<string | null>(null);

  const scrollElementRef = React.useRef<HTMLDivElement | null>(null);

  const { contains } = Combobox.useFilter({ sensitivity: 'base', value });

  const filteredItems = React.useMemo(() => {
    return virtualItems.filter((item) => contains(item, searchValue));
  }, [contains, searchValue]);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 32,
    overscan: 20,
    paddingStart: 8,
    paddingEnd: 8,
    scrollPaddingEnd: 8,
    scrollPaddingStart: 8,
  });

  const handleScrollElementRef = React.useCallback(
    (element: HTMLDivElement) => {
      scrollElementRef.current = element;
      if (element) {
        virtualizer.measure();
      }
    },
    [virtualizer],
  );

  const totalSize = virtualizer.getTotalSize();
  const totalSizePx = `${totalSize}px`;

  return (
    <Combobox.Root
      virtualized
      filter={contains}
      items={virtualItems}
      open={open}
      onOpenChange={setOpen}
      inputValue={searchValue}
      onInputValueChange={setSearchValue}
      value={value}
      onValueChange={setValue}
      onItemHighlighted={(item, { type, index }) => {
        if (!item) {
          return;
        }

        const isStart = index === 0;
        const isEnd = index === filteredItems.length - 1;
        const shouldScroll = type === 'none' || (type === 'keyboard' && (isStart || isEnd));
        if (shouldScroll) {
          queueMicrotask(() => {
            virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' });
          });
        }
      }}
    >
      <label className="flex flex-col gap-1 text-sm leading-5 font-medium text-gray-900">
        Search 10,000 items
        <Combobox.Input className="h-10 w-64 rounded-md font-normal border border-gray-200 pl-3.5 text-base text-gray-900 bg-[canvas] focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800" />
      </label>

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(22rem,var(--available-height))] max-w-[var(--available-width)] rounded-md bg-[canvas] text-gray-900 outline-1 outline-gray-200 shadow-lg shadow-gray-200 dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-4 py-4 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No items found.
            </Combobox.Empty>
            <Combobox.List className="p-0">
              {filteredItems.length > 0 && (
                <div
                  role="presentation"
                  ref={handleScrollElementRef}
                  className="h-[min(22rem,var(--total-size))] max-h-[var(--available-height)] overflow-auto overscroll-contain scroll-p-2"
                  style={{ '--total-size': totalSizePx } as React.CSSProperties}
                >
                  <div
                    role="presentation"
                    className="relative w-full"
                    style={{ height: totalSizePx }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const item = filteredItems[virtualItem.index];
                      if (!item) {
                        return null;
                      }

                      return (
                        <Combobox.Item
                          key={virtualItem.key}
                          index={virtualItem.index}
                          value={item}
                          className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900"
                          aria-setsize={filteredItems.length}
                          aria-posinset={virtualItem.index + 1}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <Combobox.ItemIndicator className="col-start-1">
                            <CheckIcon className="size-3" />
                          </Combobox.ItemIndicator>
                          <div className="col-start-2">{item}</div>
                        </Combobox.Item>
                      );
                    })}
                  </div>
                </div>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

const virtualItems = Array.from({ length: 10000 }, (_, i) => {
  const indexLabel = String(i + 1).padStart(4, '0');
  return `Item ${indexLabel}`;
});
```

### CSS Modules

This example shows how to implement the component using CSS Modules.

```css
/* index.module.css */
.Input {
  box-sizing: border-box;
  padding-left: 0.875rem;
  margin: 0;
  border: 1px solid var(--color-gray-200);
  width: 16rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: canvas;
  color: var(--color-gray-900);
  outline: none;

  &:focus {
    border-color: var(--color-blue);
    outline: 1px solid var(--color-blue);
  }
}

.Label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--color-gray-900);
}

.Positioner {
  outline: 0;
}

.Popup {
  box-sizing: border-box;
  border-radius: 0.375rem;
  background-color: canvas;
  color: var(--color-gray-900);
  width: var(--anchor-width);
  max-height: min(22rem, var(--available-height));
  max-width: var(--available-width);

  @media (prefers-color-scheme: light) {
    outline: 1px solid var(--color-gray-200);
    box-shadow:
      0 10px 15px -3px var(--color-gray-200),
      0 4px 6px -4px var(--color-gray-200);
  }

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
    outline-offset: -1px;
  }
}

.Scroller {
  box-sizing: border-box;
  height: min(22rem, var(--total-size));
  max-height: var(--available-height);
  overflow: auto;
  overscroll-behavior: contain;
  scroll-padding-block: 0.5rem;
}

.VirtualizedPlaceholder {
  width: 100%;
  position: relative;
}

.List {
  box-sizing: border-box;
  padding: 0;
}

.Item {
  box-sizing: border-box;
  outline: 0;
  cursor: default;
  user-select: none;
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  display: grid;
  gap: 0.5rem;
  align-items: center;
  grid-template-columns: 0.75rem 1fr;
  font-size: 1rem;
  line-height: 1rem;

  &[data-highlighted] {
    z-index: 0;
    position: relative;
    color: var(--color-gray-50);
  }

  &[data-highlighted]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.5rem;
    border-radius: 0.25rem;
    background-color: var(--color-gray-900);
  }
}

.ItemText {
  grid-column-start: 2;
}

.ItemIndicator {
  grid-column-start: 1;
}

.ItemIndicatorIcon {
  display: block;
  width: 0.75rem;
  height: 0.75rem;
}

.Empty:not(:empty) {
  box-sizing: border-box;
  font-size: 0.925rem;
  line-height: 1rem;
  color: var(--color-gray-600);
  padding: 1rem;
}
```

```tsx
/* index.tsx */
'use client';
import * as React from 'react';
import { Combobox } from '@base-ui-components/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';
import styles from './index.module.css';

export default function ExampleVirtualizedCombobox() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [value, setValue] = React.useState<string | null>(null);

  const scrollElementRef = React.useRef<HTMLDivElement | null>(null);

  const { contains } = Combobox.useFilter({ sensitivity: 'base', value });

  const filteredItems = React.useMemo(() => {
    return virtualItems.filter((item) => contains(item, searchValue));
  }, [contains, searchValue]);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 32,
    overscan: 20,
    paddingStart: 8,
    paddingEnd: 8,
    scrollPaddingEnd: 8,
    scrollPaddingStart: 8,
  });

  const handleScrollElementRef = React.useCallback(
    (element: HTMLDivElement) => {
      scrollElementRef.current = element;
      if (element) {
        virtualizer.measure();
      }
    },
    [virtualizer],
  );

  const totalSize = virtualizer.getTotalSize();
  const totalSizePx = `${totalSize}px`;

  return (
    <Combobox.Root
      virtualized
      filter={contains}
      items={virtualItems}
      open={open}
      onOpenChange={setOpen}
      inputValue={searchValue}
      onInputValueChange={setSearchValue}
      value={value}
      onValueChange={(newValue) => {
        setValue(newValue);
        setSearchValue(newValue ?? '');
      }}
      onItemHighlighted={(item, { type, index }) => {
        if (!item) {
          return;
        }

        const isStart = index === 0;
        const isEnd = index === filteredItems.length - 1;
        const shouldScroll = type === 'none' || (type === 'keyboard' && (isStart || isEnd));
        if (shouldScroll) {
          queueMicrotask(() => {
            virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' });
          });
        }
      }}
    >
      <label className={styles.Label}>
        Search 10,000 items
        <Combobox.Input className={styles.Input} />
      </label>

      <Combobox.Portal>
        <Combobox.Positioner className={styles.Positioner} sideOffset={4}>
          <Combobox.Popup className={styles.Popup}>
            <Combobox.Empty className={styles.Empty}>No items found.</Combobox.Empty>
            <Combobox.List className={styles.List}>
              {filteredItems.length > 0 && (
                <div
                  role="presentation"
                  ref={handleScrollElementRef}
                  className={styles.Scroller}
                  style={{ '--total-size': totalSizePx } as React.CSSProperties}
                >
                  <div
                    role="presentation"
                    className={styles.VirtualizedPlaceholder}
                    style={{ height: totalSizePx }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const item = filteredItems[virtualItem.index];
                      if (!item) {
                        return null;
                      }

                      return (
                        <Combobox.Item
                          key={virtualItem.key}
                          index={virtualItem.index}
                          value={item}
                          className={styles.Item}
                          aria-setsize={filteredItems.length}
                          aria-posinset={virtualItem.index + 1}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <Combobox.ItemIndicator className={styles.ItemIndicator}>
                            <CheckIcon className={styles.ItemIndicatorIcon} />
                          </Combobox.ItemIndicator>
                          <div className={styles.ItemText}>{item}</div>
                        </Combobox.Item>
                      );
                    })}
                  </div>
                </div>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

const virtualItems = Array.from({ length: 10000 }, (_, i) => {
  const indexLabel = String(i + 1).padStart(4, '0');
  return `Item ${indexLabel}`;
});
```
