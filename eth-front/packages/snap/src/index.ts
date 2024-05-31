import type {
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { panel, text } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log(request);
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**! Block number is ${await test()}.`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
      case 'update':
        console.log("updatejtujem")
        return snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: {
              publicKey: "sdasdads"
            }
          },
        })
        case 'get':
          return snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'get',
              encrypted: false
            }
          })
    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute':
      // Cron jobs can execute any method that is available to the Snap.
      // return snap.request({
      //   method: 'snap_notify',
      //   params: {
      //     type: 'native',
      //     message: 'Hello, world!',
      //   },
      // });
      return;

    default:
      throw new Error('Method not found.');
  }
};

const test = async () => {
  const provider = new ethers.JsonRpcProvider();
  const blockNumber = await provider.getBlockNumber();

  return blockNumber;
}
