import { Language } from './language.model';

export class Interest {
  constructor(

    name: string,
    query: string
  ) {}

  name: string;
  query: string;
  content: string;
  language: Language;
}
