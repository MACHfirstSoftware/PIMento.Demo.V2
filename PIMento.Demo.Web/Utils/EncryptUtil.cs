using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace PIMento.Demo.Web.Utils
{
    public class EncryptUtil
    {

        public static string EncryptBase(string email)
        {
            string stringToEncrypt = email;
            byte[] inputByteArray = Encoding.UTF8.GetBytes(stringToEncrypt);
            byte[] rgbIV = { 0x21, 0x43, 0x56, 0x87, 0x10, 0xfd, 0xea, 0x1c };
            byte[] key = Encoding.UTF8.GetBytes("A0D1nX0Q");

            using var des = DES.Create();
            using var ms = new MemoryStream();
            using var cs = new CryptoStream(ms, des.CreateEncryptor(key, rgbIV), CryptoStreamMode.Write);
            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            return Convert.ToBase64String(ms.ToArray()).Replace("+", "_").Replace("/", "*");
        }


        public static string Decrypt(string EncryptedText)
        {
            var text = EncryptedText.Replace("_", "+").Replace("*", "/");
            byte[] inputByteArray = new byte[text.Length + 1];
            byte[] rgbIV = { 0x21, 0x43, 0x56, 0x87, 0x10, 0xfd, 0xea, 0x1c };

            try
            {
                byte[] key = Encoding.UTF8.GetBytes("A0D1nX0Q");
                using var des = DES.Create();
                inputByteArray = Convert.FromBase64String(text);
                using var ms = new MemoryStream();
                using var cs = new CryptoStream(ms, des.CreateDecryptor(key, rgbIV), CryptoStreamMode.Write);
                cs.Write(inputByteArray, 0, inputByteArray.Length);
                cs.FlushFinalBlock();
                return Encoding.UTF8.GetString(ms.ToArray());
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}
