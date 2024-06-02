/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
import type {
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { heading, panel, text } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';
// eslint-disable-next-line import/no-extraneous-dependencies

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
  switch (request.method) {
    case 'hello': {
      const ts = JSON.stringify(await getEvents());
      fetch(`http://localhost:3000/log?param=HELLO${JSON.stringify(ts)}`)
        .then(async (response) => response.text())
        .then((data) => {
          console.log('Response:', data);
        })
        .catch((error) => console.error('Error:', error));
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',

          content: panel([
            text(`Hello, **${origin}**! Events ${ts}.`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    }
    case 'updateState': {
      const {
        spendingPublicKey,
        viewingPublicKey,
        spendingPrivateKey,
        viewingPrivateKey,
      } = request.params as {
        spendingPublicKey: string;
        viewingPublicKey: string;
        spendingPrivateKey: string;
        viewingPrivateKey: string;
      };
      return snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            spendingPublicKey,
            viewingPublicKey,
            spendingPrivateKey,
            viewingPrivateKey,
          },
          encrypted: false,
        },
      });
    }
    case 'getState':
      return snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'get',
          encrypted: false,
        },
      });
    case 'clearState':
      return snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'clear',
          encrypted: false,
        },
      });
    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute': {
      const event = await getEvents();
      fetch(`http://localhost:3000/log?param=${JSON.stringify(event)}`)
        .then(async (response) => response.text())
        .then((data) => {
          console.log('Response:', data);
        })
        .catch((error) => console.error('Error:', error));
      if (event === undefined) {
        break;
      }
      console.log('Event:', event);
      // eslint-disable-next-line consistent-return
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            heading('Received Transaction'),
            text(
              `Received on Stealth Address:  ${
                event?.stealthAddress as string
              }`,
            ), // ${event.stealthAddress}
            text(
              `Received Amount: ${event?.valueInEther} ETH`, // ${event.valueInEther}
            ),
          ]),
        },
      });
      break;
    }

    default:
      throw new Error('Method not found.');
  }
};

let fromBlock = 0;
const provider = new ethers.JsonRpcProvider(
  'https://sepolia.gateway.tenderly.co',
);

const contractAddress = '0x6f4ef23960C89145896ee15140128e1b93925668';

const contractABI = [
  'event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)',
];

async function pollForEvents(blocksToQuery = 5000) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  const latestBlock = await provider.getBlockNumber();
  if (fromBlock === 0) {
    fromBlock = latestBlock - blocksToQuery;
  }

  const eventInterface = new ethers.Interface(contractABI);

  console.log('Contract:', contract);
  console.log('Querying blocks:', latestBlock - blocksToQuery, 'to', 'latest');

  const events = await contract.queryFilter(
    'Announcement',
    fromBlock,
    latestBlock,
  );

  const eventsFormatted = await Promise.all(
    events.map(async (event) => {
      const parsedLog = eventInterface.parseLog(event);
      const { transactionHash } = event;
      const transaction = await provider.getTransaction(transactionHash);
      const valueInEther = ethers.formatEther(transaction?.value ?? BigInt(0));
      return {
        schemeId: parsedLog?.args.schemeId.toString(),
        stealthAddress: parsedLog?.args.stealthAddress,
        caller: parsedLog?.args.caller,
        ephemeralPubKey: ethers.hexlify(parsedLog?.args.ephemeralPubKey),
        metadata: ethers.hexlify(parsedLog?.args.metadata),
        valueInEther,
      };
    }),
  );

  return {
    eventsLength: events.length,
    latestBlock,
    eventsFormatted,
    fromBlock,
    events,
  };
}

/**
 * Get the latest event from the contract.
 */
async function getEvents() {
  const { eventsFormatted, latestBlock } = await pollForEvents();
  fromBlock = latestBlock;
  if (eventsFormatted.length === 0) {
    return undefined;
  }
  return eventsFormatted.at(-1); // just for hackathon
}

// export const onUserInput: OnUserInputHandler = async ({
//   id,
//   event,
//   // context,
// }) => {
//   fetch(`http://localhost:3000/log?param=onUserInput`)
//     .then(async (response) => response.text())
//     .then((data) => {
//       console.log('Response:', data);
//     })
//     .catch((error) => console.error('Error:', error));
//   if (event.type === UserInputEventType.FormSubmitEvent) {
//     switch (id) {
//       case 'received-to-stealth-addr': {
//         await snap.request({
//           method: 'snap_dialog',
//           params: {
//             type: 'confirmation',
//             // id: 'received-to-stealth-addr',
//             content: panel([text(`Context. }`)]),
//           },
//         });
//         break;
//       }

//       default:
//         await snap.request({
//           method: 'snap_dialog',
//           params: {
//             type: 'confirmation',
//             // id: 'received-to-stealth-addr',
//             content: panel([text(`Context.    default case`)]),
//           },
//         });
//         break;
//     }
//   }
//   await snap.request({
//     method: 'snap_dialog',
//     params: {
//       type: 'confirmation',
//       // id: 'received-to-stealth-addr',
//       content: panel([text(`Context.   nije usao u case`)]),
//     },
//   });
// };
