import { destinationMachine } from './destinationMachine';
import { assert, describe, test } from 'vitest';
import { interpret } from 'xstate';

describe('destinationMachine', () => {
    test('transition IDLE -> IN PROGRESS', () => {
        const actualState = destinationMachine.transition('idle', { type: 'request' });
        assert(actualState.matches('in progress'));
    });
    test('transition IN PROGRESS -> DONE', () => {
        const machine = interpret(destinationMachine)
            .onTransition((state) => {
                if (state.matches('done')) {
                    assert(true)
                    // assert(state.event.path === 'mocked path');
                    assert(state.context.destinationPath === 'mocked path');
                }
            });
        machine.start();
        machine.send('request');
    });
});