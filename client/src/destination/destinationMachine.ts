import { createMachine, DoneInvokeEvent } from 'xstate';
import { CancelRequested, RetryRequested } from '../common';

type Services = {
  fetchDestinationPath: {
    data: { path: string };
  };
};
export type EventDone = { type: 'done.invoke.invoke'; data: { path: string } };
export type EventFailed = { type: 'error.platform.invoke'; data: { message: string } };
type DestinationResponse = { path: string };
export type FetchDestinationPath = () => Promise<DestinationResponse>;

function onDoneReturnDestinationPath(_ctx: {}, event: DoneInvokeEvent<DestinationResponse>): string {
  return event.data.path;
}

export const destinationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgIAUAnAeykrlgGIJrCz8A3agazHa94BtAAwBdRKAAO1WLgAuuVhJAAPRAGYAnMJIBWAOwAOAIzHNugEzHh6gGyaANCACeiY4YskALJt+aLwsI+Fl7G+gC+4U5oWHiEpBQ0dAyMYJQ0lCSSADbocgBm1JSo-DxgIuJIINKyCkpVaghaOgYmZpbWdo4uiBaG6iTGtsNehl76turCQ5HRGDgExOxUtPSwTADCAIIAchsAogAyAPoASvsAigCq+wDKACr7ACIVyjXyivjKjc16RqbmKw2exOVwIYzqYwkPy+WxhfReWwBCJREAxBbxEj5dC4bKQRjne6nACaZ0uNwez1eVXedS+DUQXhsJFsuiR0w6hl8oN66k8w2Gllso36mkRszR8ziS0w6HwmDAeIgBP2RNJ52ud0eLzEbxkH3qoEaTIGrPZxk53J6CBMekC9vUPhhKNR+GoEDgynR0qIetqn2+iAAtLYeQgQyR7VHo4EUXNYosEvgVsl1n6DfSjYyLGHDLZBgLdGz7FNNMYLBLvYmsTilem6YGEHDPLpNF0TCYpqywyEoSFfPotMNB6FbJWpdXZfLFZB6wGGU3y3o2-YOxDhN3rdpI-0+UNbEYxbZDOOE5iWIQ54bVIhm8v2+515uwe4dBZdPb-B5NHnhC7wkAA */
  createMachine({
    predictableActionArguments: true,
    context: {},
    tsTypes: {} as import('./destinationMachine.typegen').Typegen0,
    schema: {
      services: {} as Services,
      events: {} as EventDone | EventFailed | RetryRequested | CancelRequested,
    },
    initial: 'inProgress',
    states: {
      inProgress: {
        invoke: {
          id: 'invoke',
          src: 'fetchDestinationPath',
          onDone: 'done',
          onError: 'failed',
        },
        on: {
          CANCEL_REQUESTED: 'canceled',
        },
      },
      failed: {
        on: {
          RETRY_REQUESTED: 'inProgress',
        },
      },
      canceled: {
        on: {
          RETRY_REQUESTED: 'inProgress',
        },
      },
      done: {
        type: 'final',
        data: onDoneReturnDestinationPath,
      },
    },
  });
