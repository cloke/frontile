import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerCustomStyles } from '@frontile/theme';
import { tv } from 'tailwind-variants';

module(
  'Integration | Component | Dropdown | @frontile/buttons',
  function (hooks) {
    setupRenderingTest(hooks);

    registerCustomStyles({
      overlay: tv({
        slots: {
          base: 'overlay',
          backdrop: 'overlay__backdrop',
          content: 'overlay__content'
        },
        variants: {
          inPlace: {
            true: {
              base: 'overlay--in-place',
              backdrop: '',
              content: ''
            }
          }
        }
      }) as never
    });

    test('it renders the trigger and menu when opened', async function (assert) {
      const clickedOn: string[] = [];
      this.set('onAction', function (key: string) {
        clickedOn.push(key);
      });

      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @onAction={{this.onAction}}
              @intent="primary"
              @destinationElementId="my-destination"
              @disableTransitions={{true}}
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      assert.dom('[data-test-id="listbox"]').doesNotExist();
      await click('[data-test-id="dropdown-trigger"]');

      assert.dom('[data-test-id="listbox"]').exists();

      assert.dom('[data-key="profile"]').exists();
      assert.dom('[data-key="settings"]').exists();

      await click('[data-key="profile"]');

      assert.deepEqual(clickedOn, ['profile']);
    });

    test('it renders accessibility attributes', async function (assert) {
      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @disableTransitions={{true}}
              @destinationElementId="my-destination"
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      assert
        .dom('[data-test-id="dropdown-trigger"]')
        .hasAria('haspopup', 'true');
      assert
        .dom('[data-test-id="dropdown-trigger"]')
        .hasAria('expanded', 'false');
      assert
        .dom('[data-test-id="dropdown-trigger"]')
        .hasAttribute('aria-controls');

      await click('[data-test-id="dropdown-trigger"]');

      assert
        .dom('[data-test-id="dropdown-trigger"]')
        .hasAria('expanded', 'true');
    });

    test('it shows backdrop when @disableBackdrop=false', async function (assert) {
      this.set('disableBackdrop', true);

      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @disableBackdrop={{this.disableBackdrop}}
              @disableTransitions={{true}}
              @destinationElementId="my-destination"
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      await click('[data-test-id="dropdown-trigger"]');

      assert.dom('.overlay__backdrop').doesNotExist();

      this.set('disableBackdrop', false);

      assert.dom('.overlay__backdrop').exists();
    });

    test('on item click, closes menu, calls @onClose', async function (assert) {
      let calledClosed = false;
      this.set('onClose', () => {
        calledClosed = true;
      });

      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown @onClose={{this.onClose}} as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @disableTransitions={{true}}
              @destinationElementId="my-destination"
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      assert.dom('[data-test-id="listbox"]').doesNotExist();
      await click('[data-test-id="dropdown-trigger"]');
      assert.dom('[data-test-id="listbox"]').exists();

      await click('[data-key="profile"]');
      assert.dom('[data-test-id="listbox"]').doesNotExist();
      assert.equal(calledClosed, true, 'should called onClose argument');
    });

    test('on item click, does not close menu when @closeOnItemSelect=false', async function (assert) {
      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown @closeOnItemSelect={{false}} as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @disableTransitions={{true}}
              @destinationElementId="my-destination"
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      assert.dom('[data-test-id="listbox"]').doesNotExist();
      await click('[data-test-id="dropdown-trigger"]');
      assert.dom('[data-test-id="listbox"]').exists();

      await click('[data-key="profile"]');
      assert.dom('[data-test-id="listbox"]').exists();
    });

    test('clicking outside (overlay) closes menu', async function (assert) {
      let calledClosed = false;
      this.set('onClose', () => {
        calledClosed = true;
      });

      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown @onClose={{this.onClose}} as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @disableTransitions={{true}}
              @destinationElementId="my-destination"
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      assert.dom('[data-test-id="listbox"]').doesNotExist();
      await click('[data-test-id="dropdown-trigger"]');
      assert.dom('[data-test-id="listbox"]').exists();

      await click('.overlay');
      assert.dom('[data-test-id="listbox"]').doesNotExist();
      assert.equal(calledClosed, true, 'should called onClose argument');
    });

    test('on pressing arrow up/down key, opens the menu', async function (assert) {
      await render(
        hbs`
          <div id="my-destination"></div>
          <Dropdown as |d|>
            <d.Trigger @intent="primary" @size="sm">Dropdown</d.Trigger>

            <d.Menu
              @disableTransitions={{true}}
              @destinationElementId="my-destination"
              as |Item|
            >
              <Item @key="profile">My Provile</Item>
              <Item @key="settings">Settings</Item>
            </d.Menu>
          </Dropdown>`
      );

      assert.dom('[data-test-id="listbox"]').doesNotExist();
      await triggerKeyEvent(
        '[data-test-id="dropdown-trigger"]',
        'keyup',
        'ArrowDown'
      );

      assert.dom('[data-test-id="listbox"]').exists();
    });
  }
);
