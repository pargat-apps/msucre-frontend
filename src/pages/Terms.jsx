import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Please read these terms carefully before placing your order
          </p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Introduction */}
          <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded">
            <p className="text-gray-800">
              Please read these Terms and Conditions carefully before placing an order with <strong>M. Sucré</strong>. 
              By confirming your order, you agree to the following terms.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                1
              </span>
              Orders & Payments
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>All orders must be placed <strong>at least 6 days in advance</strong>.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>A <strong>50% non-refundable deposit</strong> is required to confirm your order.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>The remaining balance is due before you receive your order at delivery/pickup.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Orders are not confirmed until deposit is received.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Accepted payment methods: <strong>Interac e-Transfer, Cash</strong>.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                2
              </span>
              Cancellations & Refunds
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Cancellations made <strong>before 48 hours</strong> of pickup/delivery date may be eligible for a partial refund (excluding the non-refundable deposit).</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Cancellations made after this period are non-refundable.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>If you fail to collect your order on the agreed date/time, the order will be considered forfeited, and no refund will be given.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>In the rare case that we must cancel due to unforeseen circumstances, a full refund will be issued.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                3
              </span>
              Changes to Orders
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Changes (design, size, date, etc.) must be requested <strong>at least 4 days before</strong> your order date.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We will do our best to accommodate changes, but they are not guaranteed.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Additional charges may apply for last-minute adjustments.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                4
              </span>
              Allergies & Dietary Restrictions
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Our products contain common allergens such as <strong>dairy, gluten, and eggs</strong>.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>It is the customer's responsibility to inform us of any allergies at the time of ordering.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We do not guarantee allergen-free cakes and are not liable for allergic reactions.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                5
              </span>
              Design & Decoration
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We will make every effort to match your design request; however, slight variations in color, shape, or decoration may occur as each cake is handmade.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We do not copy other bakers' work exactly but can use them for inspiration.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Fresh flowers or other non-edible decorations must be approved for food use by the customer if provided by a third party.</span>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                6
              </span>
              Pickup & Delivery
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Pickup and delivery times are scheduled in advance and must be strictly respected.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Late pickups may result in additional fees or order forfeiture.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Once the cake leaves our premises, we are not responsible for any damage during transportation or handling.</span>
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                7
              </span>
              Cake Storage & Handling
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Cakes should be stored in a cool, dry place or refrigerated if advised.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Instructions will be provided upon pickup/delivery.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We are not responsible for damage caused by improper storage or handling after collection.</span>
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                8
              </span>
              Photos & Marketing
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We reserve the right to photograph your cake for marketing and social media purposes.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>If you prefer your cake not to be photographed or shared, please notify us when placing your order.</span>
              </li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                9
              </span>
              Liability
            </h2>
            <ul className="space-y-3 ml-11 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Our liability is limited to the value of the cake purchased.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>We are not responsible for indirect losses, emotional distress, or special damages arising from issues with your order.</span>
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                10
              </span>
              Agreement
            </h2>
            <div className="ml-11 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-gray-800 font-medium">
                By placing an order with <strong>M. Sucré</strong>, you acknowledge that you have read, 
                understood, and agree to these Terms and Conditions.
              </p>
            </div>
          </section>

          {/* Contact */}
          <div className="border-t pt-6 mt-8">
            <h3 className="font-semibold text-gray-900 mb-3">Questions about our Terms?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions regarding these terms and conditions, please contact us.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">
                Contact Us
              </Link>
              <Link to="/catalog" className="btn-secondary">
                Browse Products
              </Link>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleDateString('en-CA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

