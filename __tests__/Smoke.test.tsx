/** Smoke test: every screen must mount without throwing. */
import { expect, jest, test } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from '../App';

// react-test-renderer has no native view tree for the native-driver bridge
jest.useFakeTimers();

test('app mounts and walks loader -> menu -> game -> practice -> gameover', () => {
  let tree: any;
  act(() => {
    tree = renderer.create(<App />);
  });

  // loader auto-advances after 8s
  act(() => {
    jest.advanceTimersByTime(8200);
  });

  const findByLabel = (label: string) => {
    const all = tree.root.findAll(
      (n: any) => n.props && n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
      { deep: true },
    );
    return all[0];
  };

  // Menu -> Game
  const start = findByLabel('Start learning C major');
  expect(start).toBeTruthy();
  act(() => {
    start.props.onPress();
  });

  // Game -> Practice
  const practice = findByLabel('Practice');
  expect(practice).toBeTruthy();
  act(() => {
    practice.props.onPress();
  });

  // Practice start
  const startPractice = findByLabel('START PRACTICE');
  expect(startPractice).toBeTruthy();
  act(() => {
    startPractice.props.onPress();
  });
  act(() => {
    jest.advanceTimersByTime(5000);
  });

  const finish = findByLabel('Finish session');
  expect(finish).toBeTruthy();
  act(() => {
    finish.props.onPress();
  });

  // Game over must be reachable
  const again = findByLabel('PRACTICE AGAIN');
  expect(again).toBeTruthy();

  act(() => {
    tree.unmount();
  });
});

test('every tab, settings and the sheet editor mount without throwing', () => {
  let tree: any;
  act(() => {
    tree = renderer.create(<App />);
  });
  act(() => {
    jest.advanceTimersByTime(8200);
  });

  const press = (label: string) => {
    const node = tree.root.findAll(
      (n: any) =>
        n.props && n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
      { deep: true },
    )[0];
    expect(node).toBeTruthy();
    act(() => {
      node.props.onPress();
    });
  };

  press('Next key');
  press('Key C#/Db. Open key list.');
  press('Close picker');
  press('Save this shape');

  press('Sheets tab');
  press('CREATE SHEET');
  press('Back to song sheets');

  press('Tones tab');
  press('String 6, E2, 82.41 hertz');
  act(() => {
    jest.advanceTimersByTime(2500);
  });

  press('Finder tab');
  press('Settings');
  press('Up');
  press('Back to Chord Finder');

  act(() => {
    tree.unmount();
  });
});
