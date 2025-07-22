"""altera tamanho smtp_password para 512

Revision ID: ce99bb484a6e
Revises: 76f3f17b2910
Create Date: 2025-07-18 21:12:14.467867

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ce99bb484a6e'
down_revision = '76f3f17b2910'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('users', 'smtp_password',
        existing_type=sa.String(),
        type_=sa.String(length=512),
        existing_nullable=False)


def downgrade():
    op.alter_column('users', 'smtp_password',
        existing_type=sa.String(length=512),
        type_=sa.String(),  
        existing_nullable=False)
