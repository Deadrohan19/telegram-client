
"use server"

import { TelegramClient, Api } from "telegram"
import { ApiCredentials } from "telegram/client/auth";
import { StringSession } from "telegram/sessions"
import fs from 'fs';

export async function isAuthorized() {
  const sessionId = await readConfig();
  const client = new TelegramClient(new StringSession(sessionId), Number.parseInt(API_ID as string), API_HASH as string, {});
  client.connect();
  return (await client.checkAuthorization());
}


interface AuthResult {
  success: boolean
  message: string
  sessionString?: string | void
  requires2FA?: boolean
  phoneCodeHash?: string
}

const API_ID = process.env.TELEGRAM_API_ID;
const API_HASH = process.env.TELEGRAM_API_HASH;


const apiCredentials: ApiCredentials = {
  apiId: Number.parseInt(API_ID as string),
  apiHash: API_HASH as string,
}


export async function readConfig() {
  try{
    const configFile = 'config.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const sessionId = config.sessionId;
    return sessionId;
  } catch (error) {
    return "";
  }
}

export async function writeConfig(client: TelegramClient) {
    const sessionId = client.session.save();
    const configFile = 'config.json';
    const config = { sessionId };
    fs.writeFileSync(configFile, JSON.stringify(config));
}

export async function initializeTelegramClient() {
  const sessionId: string = await readConfig();
  return new TelegramClient(new StringSession(sessionId), Number.parseInt(API_ID as string), API_HASH as string, {
    connectionRetries: 5,
  });

}

export async function sendCode(phoneNumber: string): Promise<AuthResult> {
  const client = await initializeTelegramClient()

  try {
    await client.connect()
    const result = await client.sendCode(apiCredentials, phoneNumber);

    writeConfig(client);
    // await store.set("PHONE_CODE_HASH", phoneCodeHash)
    return { success: true, message: "Code sent successfully", phoneCodeHash: result.phoneCodeHash }
  } catch (error) {


    if(error instanceof Error) {
        return { success: false, message: error.message }
    }
    return { success: false, message: "failed to send code" }

  } finally {
    await client.disconnect()
  }
}

export async function verifyCode(phoneNumber: string, phoneCode: string, phoneCodeHash: string): Promise<AuthResult> {
  const client = await initializeTelegramClient()
  // const phoneCodeHash = await store.get("PHONE_CODE_HASH")

  try {
    await client.connect()
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode,
      }),
    )

    if ("password" in result) {
      return {
        success: true,
        message: "2FA required",
        requires2FA: true,
      }
    }

    const sessionString = client.session.save()
    // await store.set("SESSION_STRING", sessionString)
    writeConfig(client);

    return {
      success: true,
      message: "Logged in successfully",
      sessionString,
    }
  } catch (error) {
    console.log(error);
    if(error instanceof Error) {
      if(error.message.includes("SESSION_PASSWORD_NEEDED")){
        return { success: true, requires2FA: true, message: error.message }
      }
    }
    return { success: false, message: "failed to verify code" }
  } finally {
    await client.disconnect()
  }
}

export async function verify2FA(password: string): Promise<AuthResult> {
  const client = await initializeTelegramClient()

  try {
    await client.connect()
    // await client.checkPassword(password)
    const user = await client.signInWithPassword(
      apiCredentials, {
      password: async () => password,
      onError: (error) => console.error("Error signing in with password:", error),
    });

    const sessionString = client.session.save()
    // await store.set("SESSION_STRING", sessionString)
        writeConfig(client);


    return {
      success: true,
      message: "Logged in successfully",
      sessionString,
    }
  } catch (error) {
    if(error instanceof Error) {
        return { success: false, message: error.message }
    }
    return { success: false, message: "failed to verify 2FA" }
  } finally {
    await client.disconnect()
  }
}

export async function getUserInfo() {
  const client = await initializeTelegramClient()
  // const sessionString = await store.get("SESSION_STRING")

  // if (!sessionString) {
  //   return { success: false, message: "No session found" }
  // }

  try {
    await client.connect()
    const me = await client.getMe()

    return {
      success: true,
      username: me.username,
    }
  } catch (error) {
    if(error instanceof Error) {
        return { success: false, message: error.message }
    }
    return { success: false, message: "failed to fetch user info" }
  } finally {
    await client.disconnect()
  }
}