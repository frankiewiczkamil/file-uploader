import { assign, createMachine } from "xstate";

type DestinationContext = {
    error?: string;
    destinationPath?: string;

}
export const destinationMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QBE4BcCWA7Ahpg9lgAQAOeAFkQGZhoDG52UAdBhADZgDEATmAI4BXdEQjpseDIVIUA2gAYAuolAl8sDASwqQAD0QBaAIwB2AGzMAzCaPyAnNYCsAGhABPQ0bPzmADnnyJr5GAEyOAL7hrqiwmLhaMmiUNPSMWCzYpDz4UHywsFywgnR0cLAKykggahpaOvoIIQAsRsxGviYu7p7efgFBoRFRIDFxktJkSdS0DEysxCTZuWVcYDzZPBU6NZpS2lUNJibMTfJmYa4eCAYhlj525o7nQ9Hi8XuJyTNpLFQ4GJwILxaDw3Fsqjs6gdEEYmnZmPIjE8Lt1rrd7o9npFhlh8GJ4FVRhIEpMvqkmNt1LtCPVDJZLK1bA5OpdDKcLE0zJZHC0zHz+SZIq9YsSPqTpuT0vMsjk8gTVFSoaAGnYQm12SirsZev5AsEwkKRm9xgsKBLZlK2JxKbU9rS0b5LG17E5WdcvD5dQMDcMie8JmaUhbfv9ATbqftlTDQsw+SY7GYOl0tQzfMwE9zefy44a-SbPuafswIIQwOGlXpEJYOunEyzUdrPf19UNIkA */
    createMachine<DestinationContext>({
        id: 'Destination path fetching',
        context: {},
        schema: {
            services: {} as {
                fetchDestinationPath: {
                    data: { destinationPath: string };
                };
            }
        },
        initial: 'idle',
        states: {
            idle: {
                on: {
                    "request": "in progress"
                }
            },
            ['in progress']: {
                invoke: {
                    src: 'fetchDestinationPath',
                    onDone: {
                        target: 'done',
                        actions: assign({
                            destinationPath: (context, event) => {
                                const path = event?.data?.path;
                                context.destinationPath = path;
                                return path;
                            }
                        })
                    },
                    onError: 'failed'
                },
            },
            failed: {
                on: {
                    retry: "in progress"
                }
            },
            done: {}
        }
    }).withConfig({
        services: {
            fetchDestinationPath: async function () {
                await Promise.resolve();
                return { path: 'mocked path' };
            }
        }
    });