import { useState, useRef, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import TourStatLogo from './TourStatLogo';

interface EmailVerificationPageProps {
  onVerify: () => void;
}

export default function EmailVerificationPage({ onVerify }: EmailVerificationPageProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.every((digit) => digit !== '')) {
      setTimeout(() => {
        onVerify();
      }, 500);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-lime-400 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl mb-2">Verify your email</h2>
          <p className="text-neutral-600">
            We've sent a 6-digit verification code to your email address. Please enter it below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex gap-3 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl border-2 border-neutral-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white"
            disabled={code.some((digit) => digit === '')}
          >
            Verify email
          </Button>
        </form>

        <div className="mt-6 text-center">
          {timer > 0 ? (
            <p className="text-sm text-neutral-600">
              Resend code in <span className="text-green-600">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Resend verification code
            </button>
          )}
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-center text-neutral-600">
            <span className="text-green-600">Tip:</span> Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
}