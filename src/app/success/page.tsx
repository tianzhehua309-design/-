import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-green-500 animate-in zoom-in duration-500 delay-150" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-2">订单已提交</h1>
            <p className="text-slate-500 text-center mb-10 leading-relaxed text-sm">
                您的订单已经发送给老板啦。<br />
                请到店后当面付款或等候老板送货。
            </p>

            <Link
                href="/"
                className="w-full max-w-xs bg-slate-800 text-white font-medium py-3.5 px-6 rounded-full text-center shadow-lg shadow-slate-800/20 active:scale-95 transition-all"
            >
                返回首页继续逛
            </Link>
        </div>
    )
}
