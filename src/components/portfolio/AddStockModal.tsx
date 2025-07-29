import React, { useState, useRef } from 'react';
import StockSearch, { StockSearchResult } from '@/components/StockSearch';
import { Button } from '@/components/ui/button';

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ open, onClose, onSuccess }) => {
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setSelectedStock(null);
      setQuantity('');
      setBuyPrice('');
      setError(null);
    }
  }, [open]);

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setError(null);
    setTimeout(() => quantityInputRef.current?.focus(), 100);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !quantity || !buyPrice) {
      setError('Please fill all fields');
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          quantity,
          buyPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
        onSuccess();
      } else {
        setError(data.error || 'Failed to add stock');
      }
    } catch (err) {
      setError('Failed to add stock');
    } finally {
      setAdding(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Add Stock to Portfolio</h2>
        <div className="mb-4">
          <StockSearch onStockSelect={handleStockSelect} />
        </div>
        {selectedStock && (
          <form className="space-y-4" onSubmit={handleAddStock}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <div className="font-semibold text-gray-800 bg-gray-50 rounded px-3 py-2 border border-gray-200">{selectedStock.symbol} - {selectedStock.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                ref={quantityInputRef}
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                value={buyPrice}
                onChange={e => setBuyPrice(e.target.value)}
                required
                placeholder="Enter buy price"
              />
            </div>
            {error && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <Button type="submit" disabled={adding} className="px-6 py-2 rounded-lg">
                {adding ? 'Adding...' : 'Add to Portfolio'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddStockModal; 