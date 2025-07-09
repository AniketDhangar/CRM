import React from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useNavigate } from 'react-router-dom';

const MenuTree = () => {
  const navigate = useNavigate();

  return (
    <SimpleTreeView>
    
        <TreeItem
          itemId="1"
          label="Dashboard"
          onClick={() => navigate('/')}
        />
        <TreeItem
          itemId="2"
          label="Orders"
          onClick={() => navigate('/order')}
        />
        <TreeItem
          itemId="3"
          label="Expenses"
          onClick={() => navigate('/expenses')}
        />
        <TreeItem
          itemId="4"
          label="Services"
          onClick={() => navigate('/services')}
        />
        <TreeItem
          itemId="5"
          label="Enquiries"
          onClick={() => navigate('/enquires')}
        />
    
    </SimpleTreeView>
  );
};

export default MenuTree;
