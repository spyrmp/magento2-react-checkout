import React from 'react';
import { bool } from 'prop-types';
import { TruckIcon } from '@heroicons/react/outline';

import AddressOptions from '../../address/components/AddressOptions';
import {
  isCartAddressValid,
  isValidCustomerAddressId,
  prepareFormAddressFromCartAddress,
} from '../../../utils/address';
import { __ } from '../../../i18n';
import LocalStorage from '../../../utils/localStorage';
import { shippingAddrOtherOptionField } from '../utility';
import useAddressOtherOptions from '../../address/hooks/useAddressOtherOptions';
import useShippingAddressAppContext from '../hooks/useShippingAddressAppContext';
import useShippingAddressCartContext from '../hooks/useShippingAddressCartContext';
import useShippingAddressFormikContext from '../hooks/useShippingAddressFormikContext';

function ShippingAddressOthers({ forceHide }) {
  const {
    setFieldValue,
    submitHandler,
    selectedAddress,
    setSelectedAddress,
    setCustomerAddressSelected,
    shippingOtherOptionSelected,
    setShippingAddressFormFields,
  } = useShippingAddressFormikContext();
  const { cartShippingAddress } = useShippingAddressCartContext();
  const { isLoggedIn, customerAddressList } = useShippingAddressAppContext();
  const isCartShippingAddressValid = isCartAddressValid(cartShippingAddress);
  const mostRecentAddressList = LocalStorage.getMostRecentlyUsedAddressList();
  const addressOptions = useAddressOtherOptions({
    selectedAddress,
    cartAddress: cartShippingAddress,
  });

  /**
   * Perform when an other address option is changed.
   */
  const handleOptionChange = (event) => {
    const addressId = event.target.value;
    const customerAddress = customerAddressList[addressId];

    setFieldValue(shippingAddrOtherOptionField, addressId);

    if (isCartShippingAddressValid) {
      return;
    }

    setSelectedAddress(addressId);
    setCustomerAddressSelected(isValidCustomerAddressId(addressId));

    if (mostRecentAddressList[addressId]) {
      setShippingAddressFormFields(mostRecentAddressList[addressId]);
    } else if (customerAddress) {
      setShippingAddressFormFields(
        prepareFormAddressFromCartAddress({ ...customerAddress })
      );
    }
  };

  /**
   * Executes when "Ship Here" button is pressed.
   */
  const handleShipToOtherOption = async () => {
    await submitHandler(shippingOtherOptionSelected);
    setFieldValue(shippingAddrOtherOptionField, '');
  };

  if (!isLoggedIn || forceHide) {
    return null;
  }

  const submitButtonLabel = (
    <>
      <TruckIcon className="w-6 h-6 pr-1" />
      <span className="text-xs">{__('Ship Here')}</span>
    </>
  );

  return (
    <AddressOptions
      title={
        isCartShippingAddressValid
          ? __('OTHER ADDRESSES')
          : __('CHOOSE FROM THE ADDRESS LIST')
      }
      options={addressOptions}
      submitButtonLabel={submitButtonLabel}
      inputName={shippingAddrOtherOptionField}
      selectedOption={shippingOtherOptionSelected}
      actions={{ handleOptionChange, handleShipToOtherOption }}
    />
  );
}

ShippingAddressOthers.propTypes = {
  forceHide: bool,
};

ShippingAddressOthers.defaultProps = {
  forceHide: false,
};

export default ShippingAddressOthers;
