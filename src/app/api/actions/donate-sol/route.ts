

import {
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    BLOCKCHAIN_IDS,
  } from "@solana/actions";
  
  import {
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
  } from "@solana/web3.js";
  

  const blockchain = BLOCKCHAIN_IDS.devnet;
  
  const connection = new Connection("https://api.devnet.solana.com");
  
  const donationWallet = "2QyvFn7BWUTqUiaxDmxdYhMmfEEB1hUo7A1T4t4eXLfR";
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, x-blockchain-ids, x-action-version",
    "Content-Type": "application/json",
    "x-blockchain-ids": blockchain,
    "x-action-version": "2.4",
  };
  

  export const OPTIONS = async () => {
    return new Response(null, { headers });
  };
  

  export const GET = async (req: Request) => {
    const response: ActionGetResponse = {
      type: "action",
      icon: `${new URL("/blink.jpg", req.url).toString()}`,
      label: "1 SOL",
      title: "Donate SOL",
      description:
        "This Blink demonstrates how to donate SOL on the Solana blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.",

      links: {
        actions: [
          {
        
            type: "transaction",
            label: "0.01 SOL",
         
            href: `/api/actions/donate-sol?amount=0.01`,
          },
          {
            type: "transaction",
            label: "0.05 SOL",
            href: `/api/actions/donate-sol?amount=0.05`,
          },
          {
            type: "transaction",
            label: "0.1 SOL",
            href: `/api/actions/donate-sol?amount=0.1`,
          },
          {
        
            type: "transaction",
            href: `/api/actions/donate-sol?amount={amount}`,
            label: "Donate",
            parameters: [
              {
                name: "amount",
                label: "Enter a custom SOL amount",
                type: "number",
              },
            ],
          },
        ],
      },
    };
  

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  };
  
  export const POST = async (req: Request) => {
    try {
    
      const url = new URL(req.url);
  
 
      const amount = Number(url.searchParams.get("amount"));
  
      const request: ActionPostRequest = await req.json();
      const payer = new PublicKey(request.account);
  
      
      const receiver = new PublicKey(donationWallet);
  
     
      const transaction = await prepareTransaction(
        connection,
        payer,
        receiver,
        amount
      );
  
      const response: ActionPostResponse = {
        type: "transaction",
        transaction: Buffer.from(transaction.serialize()).toString("base64"),
      };
  
      return Response.json(response, { status: 200, headers });
    } catch (error) {
     
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers,
      });
    }
  };
  
  const prepareTransaction = async (
    connection: Connection,
    payer: PublicKey,
    receiver: PublicKey,
    amount: number
  ) => {
 
    const instruction = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: new PublicKey(receiver),
      lamports: amount * LAMPORTS_PER_SOL,
    });
  
    const { blockhash } = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();
  

    return new VersionedTransaction(message);
  };