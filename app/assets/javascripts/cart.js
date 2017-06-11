  $('document').ready(function () {
    'use strict';

  });

  var Cart = {
    prefix: 'cd-',
    cardName: 'cd-cart',
    $cartTrigger: null,
    $cartContainer: null,
    $shadowLayer: null,
    $cartItems: null,
    $cartTotal: null,
    $priceList: null,

    init: function() {
      'use strict';

      this.storage = localStorage;
      this.total = this.prefix +  'total';
      this.currency = '&euro;';
      this.currencyString = '€';

      this.$cartTrigger = $('#cd-cart-trigger');
      this.$cartContainer = $('#cd-cart');
      this.$shadowLayer = $('#cd-shadow-layer');
      this.$cartItems = $('#cd-cart-items');
      this.$cartTotal = $('#cd-cart-total');

      this.createCart();
      // this.emptyCart();
      // this.deleteProduct();

      self = this;
      this.$cartTrigger.on('click', function(e) {
        e.preventDefault();
        self.toggleCart();
      });

      this.$shadowLayer.on('click', function(e) {
        e.preventDefault();
        self.toggleShadowLayer();
      });

      return Cart;
    },

    createCart: function() {
      if(this.storage.getItem(this.cardName) == null) {
        var cart = {};
        cart.items = {};

        this.storage.setItem(this.cardName, this._toJSONString(cart));
        this.storage.setItem(this.total, '0');
      } else {
        var cart = this._toJSONObject(this.storage.getItem(this.cardName));
        this.renderCart(cart);
      }
    },

    renderCart: function(cart) {
      if (this.$cartContainer.length) {
        var items = cart.items;
        for(var product_id in items) {
          var item = items[product_id];
          this._renderNewItem(product_id, item);
        }
        this._renderTotal();
      }
    },

    toggleCart: function() {
      if (this.$cartContainer.hasClass('speed-in')) {
        this.$cartContainer.removeClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').removeClass('overflow-hidden');
        });
        this.$shadowLayer.removeClass('is-visible');
      } else {
        this.$cartContainer.addClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').addClass('overflow-hidden');
        });
        this.$shadowLayer.addClass('is-visible');
      }
    },

    toggleShadowLayer: function() {
      this.$shadowLayer.removeClass('is-visible');
      // firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
      if( this.$cartContainer.hasClass('speed-in') ) {
        this.$cartContainer.removeClass('speed-in').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').removeClass('overflow-hidden');
        });
      } else {
        $('body').removeClass('overflow-hidden');
        this.$cartContainer.removeClass('speed-in');
      }
    },

    handleAddToCart: function() {
      var self = this;
      this.$priceList = $('#price-list');
      self.$priceList.find('li').each(function() {
        var $item = $(this);
        $item.find('i.add-to-cart').on('click', function(e) {
          e.preventDefault();
          var product_id = $item.data().itemId;
          var product = $item.find('.title').text(); 
          var price = parseFloat($item.find('.price').text());
          var qty = 1;
          var item = {
            product: product,
            price: price,
            qty: qty
          };

          var subTotal = qty * price;
          var total = parseFloat(self.storage.getItem(self.total)) + subTotal;
          self._addToCart(product_id, item);
          self.storage.setItem(self.total, total);
          self._renderTotal();

          self.toggleCart();
        });
      });
    },
    deleteProduct: function(product_id) {
      var cart = this.storage.getItem(this.cardName);
      var cartObject = this._toJSONObject(cart);
      var subTotal = cartObject.items[product_id].price;
      var total = parseFloat(self.storage.getItem(self.total)) - subTotal;
      delete cartObject.items[product_id];

      this.storage.setItem(this.cardName, this._toJSONString(cartObject));
      this.storage.setItem(this.total, total);

      var $cartItem = this.$cartItems.find(`li[data-item-id='${product_id}']`);
      $cartItem.remove();
      this._renderTotal();
    },

    // ---------------------------------------------------
    // Helper methods
    _toJSONObject: function(str) {
      var obj = JSON.parse(str);
      return obj;
    },

    _toJSONString: function(obj) {
      var str = JSON.stringify(obj);
      return str;
    },
    _addToCart: function(product_id, item) {
      var cart = this.storage.getItem(this.cardName);

      var cartObject = this._toJSONObject(cart);
      var items = cartObject.items;
      var qty = item.qty;
      var existing_item = items[product_id];
      if (existing_item) {
        // product exists, add qty
        existing_item.qty += qty;
        this._updateItem(product_id, existing_item);
      } else {
        // product doesn't exist, add item to items
        delete item.id;
        items[product_id] = item;
        self._renderNewItem(product_id, item);
      }

      this.storage.setItem(this.cardName, this._toJSONString(cartObject));
    },
    _updateItem: function(product_id, item) {
      var $cartItem = this.$cartItems.find(`li[data-item-id='${product_id}']`);
      var qtyString = item.qty + 'x ';
      var subtotalString = item.price * item.qty + this.currencyString;
      $cartItem.find(".cd-qty").text(qtyString);
      $cartItem.find(".cd-price").text(subtotalString);
    },
    _renderNewItem: function(product_id, item) {
      var self = this;
      var product = item.product;
      var subtotalString = item.price * item.qty + this.currencyString;
      var qtyString = item.qty + 'x ';
      var $cartItem = $("<li>", {"data-item-id": product_id});
      var $hiddenProductIdField = $("<input>", {type: 'hidden', name: 'order[items][][product_id]', value: product_id});
      $cartItem.append($hiddenProductIdField);
      var $qtyField = $("<span>", {class: 'cd-qty', text: qtyString, name: 'order[items][][qty]'});
      var $hiddenQtyField = $("<input>", {type: 'hidden', name: 'order[items][][qty]', value: item.qty});
      $cartItem.append($qtyField).append($hiddenQtyField);
      var $productNameField = $("<span>", {class: 'cd-title', text: product, name: 'order[items][][product_name]'});
      var $hiddenProductNameField = $("<input>", {type: 'hidden', name: 'order[items][][product_name]', value: product});
      $cartItem.append($productNameField).append($hiddenProductNameField);
      var $priceField = $("<div>", {class: 'cd-price', text: subtotalString, name: 'order[items][][price]'});
      var $hiddenPriceField = $("<input>", {type: 'hidden', name: 'order[items][][price]', value: item.price});
      $cartItem.append($priceField).append($hiddenPriceField);
      var $itemRemove = $('<a class="cd-item-remove cd-img-replace">Remove</a>');
      $itemRemove.on('click', function(e) {
        e.preventDefault();
        self.deleteProduct(product_id);
      });
      $cartItem.append($itemRemove);
      this.$cartItems.append($cartItem);
    },
    _renderTotal: function() {
      var total = this.storage.getItem(this.total);
      var total_string = this.storage.getItem(this.total) + ' ' + this.currencyString;
      this.$cartTotal.find('span').text(total_string);
      this.$cartTotal.find('input').val(total);
    }
  };
