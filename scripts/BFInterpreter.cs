using System;
using System.IO;

namespace BFCompiler
{
	class Program
	{
		static void Main(string[] args)
		{
			string codeToCompile = args[0];
			/*
			if(args.Length > 0)
			{
				codeToCompile = OpenFile(args[0]);
			}
			else
			{
				Console.WriteLine("File name expected as first argument.");
				System.Environment.Exit(1);
			}
			*/
            //Continue with compilling string here

            ArrayManager arrayMng = new ArrayManager();

            for(int i = 0; i < codeToCompile.Length; i++){
                switch (codeToCompile[i])
                {
                    case '<':
                        arrayMng.TraverseLeft();
                        break;
                    case '>':
                        arrayMng.TraverseRight();
                        break;
                    case '+':
                        arrayMng.IncrementValue();
                        break;
                    case '-':
                        arrayMng.DecrementValue();
                        break;
                    case '.':
                        arrayMng.PrintValue();
                        break;
                    case ',':
                        arrayMng.ReadValue();
                        break;
                    case '[':
                        if (arrayMng.CurrentElement.value == 0)
                        {
                            while (codeToCompile[i] != ']' && i < codeToCompile.Length)
                            {
                                i++;
                            }
                        }
                        break;
                    case ']':
                        if (arrayMng.CurrentElement.value != 0)
                        {
                            while (codeToCompile[i] != '[' && i >= 0)
                            {
                                i--;
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
		}

		static string OpenFile(string filename)
		{
			try
			{   // Open the text file using a stream reader.
				using (StreamReader sr = new StreamReader(filename))
				{
					// Read the stream to a string, and write the string to the console.
					String line = sr.ReadToEnd();
					return line;
				}
			}
			catch (Exception e)
			{
				Console.WriteLine("[in interpreter] The file could not be read:");
				Console.WriteLine(e.Message);
				System.Environment.Exit(1);
				return "";
			}
		}
	}

    class Element
    {
        public byte value = 0;
        public Element PreviousElement { get; set; }
        public Element NextElement { get; set; }

    }

    class ArrayManager
    {
        public Element CurrentElement;
        public ArrayManager()
        {
            CurrentElement = new Element();
        }

        public void TraverseLeft()
        {
            if (CurrentElement.PreviousElement == null)
            {
                CurrentElement.PreviousElement = new Element();
                CurrentElement.PreviousElement.NextElement = CurrentElement;
                CurrentElement = CurrentElement.PreviousElement;
            }
            else
            {
                CurrentElement = CurrentElement.PreviousElement;
            }
        }

        public void TraverseRight()
        {
            if (CurrentElement.NextElement == null)
            {
                CurrentElement.NextElement = new Element();
                CurrentElement.NextElement.PreviousElement = CurrentElement;
                CurrentElement = CurrentElement.NextElement;
            }
            else
            {
                CurrentElement = CurrentElement.NextElement;
            }
        }

        public void IncrementValue()
        {
            CurrentElement.value++;
        }

        public void DecrementValue()
        {
            CurrentElement.value--;
        }

        public void PrintValue()
        {
            Console.Write(Convert.ToChar(CurrentElement.value));
        }

        public void ReadValue()
        {
            ConsoleKeyInfo input = Console.ReadKey();
            CurrentElement.value = Convert.ToByte(input.KeyChar);
        }
    }
}