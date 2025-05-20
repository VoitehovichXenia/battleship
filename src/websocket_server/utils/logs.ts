import { styleText } from 'node:util';
import { WSMessage } from '../constants/constants';

export const logOnConnection = (text: string) => {
  console.log(
    styleText([ 'blue' ], text)
  );
};

export const logOnMessage = (text: string | WSMessage): void => {
  console.log(
    styleText([ 'green', 'bgWhite', 'bold' ], 'WS server received messsage:'),
    text
  );
};

export const logOnResponse = (text: string | WSMessage): void => {
  console.log(
    styleText([ 'yellow', 'bgGreen', 'bold' ], 'WS server respond with:'),
    text
  );
};