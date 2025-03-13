import { FiCheck } from 'react-icons/fi';

interface Feature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: Feature[];
  popular?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

const PricingCard = ({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText = 'Réserver',
  onButtonClick,
}: PricingCardProps) => {
  return (
    <div 
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        popular 
          ? 'bg-gradient-to-br from-primary/20 to-card border border-primary/30 shadow-xl shadow-primary/10 scale-105 z-10' 
          : 'bg-card hover:scale-102 hover:shadow-lg'
      }`}
    >
      {popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            Populaire
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">{price}€</span>
          <span className="text-gray-400 ml-1 text-sm">/session</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">{description}</p>
        
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className={`mt-1 mr-3 ${feature.included ? 'text-primary' : 'text-gray-600'}`}>
                <FiCheck size={16} />
              </div>
              <span className={feature.included ? 'text-gray-300' : 'text-gray-500 line-through'}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
        
        <button
          onClick={onButtonClick}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            popular 
              ? 'bg-primary hover:bg-primary-hover text-white' 
              : 'bg-card-hover hover:bg-gray-800 text-white'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PricingCard; 